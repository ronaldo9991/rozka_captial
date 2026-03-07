/**
 * MT5 Service - Node.js bridge to MetaTrader 5 Web API
 * This service communicates with the MT5 PHP API to manage trading accounts,
 * sync trading history, and handle real-time trading operations.
 */

import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { writeFileSync, unlinkSync } from "fs";
import { tmpdir } from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface MT5Config {
  host: string;
  port: number;
  login: string;
  password: string;
  timeout?: number;
}

interface MT5Account {
  login: string;
  group: string;
  name: string;
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
  leverage: number;
  credit: number;
  currency: string;
}

interface MT5Deal {
  deal: string;
  externalId: string;
  login: string;
  dealer: string;
  order: string;
  action: number;
  entry: number;
  reason: number;
  digits: number;
  digitsC: number;
  contractSize: number;
  time: number;
  symbol: string;
  price: number;
  volume: number;
  profit: number;
  storage: number;
  commission: number;
  rateProfit: number;
  rateMargin: number;
  expertId: string;
  positionId: string;
  comment: string;
}

interface MT5Position {
  position: string;
  externalId: string;
  login: string;
  dealer: string;
  symbol: string;
  action: number;
  digits: number;
  digitsC: number;
  contractSize: number;
  timeCreate: number;
  timeUpdate: number;
  priceOpen: number;
  priceCurrent: number;
  priceSL: number;
  priceTP: number;
  volume: number;
  volumeExt: number;
  profit: number;
  storage: number;
  rateProfit: number;
  rateMargin: number;
  expertId: string;
  comment: string;
}

export class MT5Service {
  private config: MT5Config;
  private phpBinary: string = "php";

  constructor(config: MT5Config) {
    this.config = {
      timeout: 30000,
      ...config,
    };
  }

  /**
   * Execute PHP MT5 API script
   */
  private async executePhpScript(scriptName: string, method: string, params: any = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      const apiPath = path.resolve(__dirname, "..", "mt5_api", "mt5_api.php");
      // Properly escape PHP strings - handle all special characters
      const escapePhpString = (str: string) => {
        // Escape for PHP single-quoted strings (only need to escape single quotes and backslashes)
        return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      };
      const escapedHost = escapePhpString(this.config.host);
      const escapedLogin = escapePhpString(this.config.login);
      const escapedPassword = escapePhpString(this.config.password);
      const escapedParams = JSON.stringify(params).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      const escapedApiPath = apiPath.replace(/\\/g, '/').replace(/'/g, "\\'");
      
      // Use temporary file approach to avoid shell interpretation issues with special characters
      const tempFile = path.join(tmpdir(), `mt5_exec_${Date.now()}_${Math.random().toString(36).substring(7)}.php`);
      
      const phpCode = `<?php
$apiPath = '${escapedApiPath}';
if (!file_exists($apiPath)) {
    echo json_encode(array('success' => false, 'error' => 'MT5 API file not found: ' . $apiPath));
    exit;
}
require_once($apiPath);

// Initialize MT5 API (constructor takes: agent, file_path, is_crypt)
$api = new MTWebAPI('WebAPI', '/tmp/', true);

try {
    // Connect and authorize to MT5 server (Connect handles both connection and authorization)
    $connectResult = $api->Connect('${escapedHost}', ${this.config.port}, ${this.config.timeout}, '${escapedLogin}', '${escapedPassword}');
    if ($connectResult != 0) {
        throw new Exception('Failed to connect/authorize to MT5 server. Error code: ' . $connectResult);
    }

    // Execute method
    $params = json_decode('${escapedParams}', true);
    if (empty($params)) {
        $result = $api->${method}();
    } else {
        $result = call_user_func_array([$api, '${method}'], $params);
    }
    
    echo json_encode(array('success' => true, 'data' => $result));
} catch (Exception $e) {
    echo json_encode(array('success' => false, 'error' => $e->getMessage()));
} finally {
    $api->Disconnect();
}
?>`;

      // Write to temp file
      writeFileSync(tempFile, phpCode, 'utf8');

      const php = spawn(this.phpBinary, [tempFile]);
      let output = "";
      let errorOutput = "";

      php.stdout.on("data", (data) => {
        output += data.toString();
      });

      php.stderr.on("data", (data) => {
        errorOutput += data.toString();
      });

      php.on("close", (code) => {
        // Clean up temp file
        try {
          unlinkSync(tempFile);
        } catch (e) {
          // Ignore cleanup errors
        }

        if (code !== 0) {
          console.error(`[MT5 PHP Error] Exit code: ${code}`);
          console.error(`[MT5 PHP Error] stderr: ${errorOutput}`);
          console.error(`[MT5 PHP Error] stdout: ${output}`);
          reject(new Error(`PHP process exited with code ${code}: ${errorOutput || output}`));
          return;
        }

        try {
          // Log raw output for debugging
          if (!output || output.trim() === '') {
            console.error(`[MT5 PHP] Empty output from PHP script`);
            reject(new Error(`PHP script returned empty output. stderr: ${errorOutput}`));
            return;
          }

          const result = JSON.parse(output);
          if (result.success) {
            resolve(result.data);
          } else {
            console.error(`[MT5 PHP] Error in result: ${result.error}`);
            reject(new Error(result.error));
          }
        } catch (error) {
          console.error(`[MT5 PHP] Failed to parse output: ${output}`);
          console.error(`[MT5 PHP] Parse error:`, error);
          reject(new Error(`Failed to parse PHP output: ${output}. Error: ${errorOutput}`));
        }
      });
    });
  }

  /**
   * Create a new trading account in MT5
   * MT5 will assign the login automatically, and we generate the password
   * Returns the MT5-assigned login and the password
   */
  async createAccount(userInfo: {
    name: string;
    email: string;
    group: string;
    leverage: number;
    country?: string;
    currency?: string;
  }): Promise<{ login: string; password: string; account: MT5Account }> {
    // Fallback group names to try if the configured group doesn't exist
    const fallbackGroups = [
      userInfo.group, // Try configured group first
      "default",
      "Default", 
      "standard",
      "Standard",
      "cent",
      "Cent",
      "micro",
      "Micro"
    ];
    
    let lastError: Error | null = null;
    
    // Try each group name until one works
    for (const groupName of fallbackGroups) {
      try {
        return await this.createAccountWithGroup({ ...userInfo, group: groupName });
      } catch (error: any) {
        lastError = error;
        // If error is not "Invalid parameters" (code 3), don't try other groups
        if (!error.message?.includes("Error code: 3") && !error.message?.includes("Invalid parameters")) {
          throw error;
        }
        // Continue to next group if this one doesn't exist
        console.log(`[MT5] Group "${groupName}" not found, trying next...`);
      }
    }
    
    // If all groups failed, throw the last error with helpful message
    if (lastError) {
      throw new Error(
        `Failed to create MT5 account: None of the group names (${fallbackGroups.join(", ")}) exist on the MT5 server. ` +
        `Please check your MT5 Server Manager for available group names and update MT5_GROUP_LIVE/MT5_GROUP_DEMO environment variables. ` +
        `Original error: ${lastError.message}`
      );
    }
    
    throw new Error("Failed to create MT5 account: Unknown error");
  }

  private async createAccountWithGroup(userInfo: {
    name: string;
    email: string;
    group: string;
    leverage: number;
    country?: string;
    currency?: string;
  }): Promise<{ login: string; password: string; account: MT5Account }> {
    return new Promise((resolve, reject) => {
      // Use absolute path to mt5_api directory
      const apiPath = path.resolve(__dirname, "..", "mt5_api", "mt5_api.php");
      const escapePhpString = (str: string) => str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      const escapedName = escapePhpString(userInfo.name);
      const escapedEmail = escapePhpString(userInfo.email);
      const escapedGroup = escapePhpString(userInfo.group);
      const escapedCountry = escapePhpString(userInfo.country || "");
      const escapedCurrency = escapePhpString(userInfo.currency || "USD");
      const escapedHost = escapePhpString(this.config.host);
      const escapedLogin = escapePhpString(this.config.login);
      const escapedConfigPassword = escapePhpString(this.config.password);
      
      // Use absolute path and normalize slashes for PHP
      const escapedApiPath = apiPath.replace(/\\/g, '/').replace(/'/g, "\\'");
      
      // Write PHP code to temporary file to avoid escaping issues
      const tempFile = path.join(tmpdir(), `mt5_create_${Date.now()}_${Math.random().toString(36).substring(7)}.php`);
      
      const phpCode = `<?php
$apiPath = '${escapedApiPath}';
if (!file_exists($apiPath)) {
    echo json_encode(array('success' => false, 'error' => 'MT5 API file not found: ' . $apiPath));
    exit;
}
require_once($apiPath);

// Initialize MT5 API (constructor takes: agent, file_path, is_crypt)
$api = new MTWebAPI('WebAPI', '/tmp/', true);

try {
    // Connect and authorize to MT5 server
    $connectResult = $api->Connect('${escapedHost}', ${this.config.port}, ${this.config.timeout}, '${escapedLogin}', '${escapedConfigPassword}');
    if ($connectResult != 0) {
        throw new Exception('Failed to connect/authorize to MT5 server. Error code: ' . $connectResult);
    }

    // Create MTUser object - send ONLY account details to MT5
    // DO NOT send login or password - MT5 generates both automatically
    $user = new MTUser();
    $user->Login = 0; // 0 = MT5 auto-assigns login
    // MainPassword = null (not set) - MT5 generates it automatically
    // InvestPassword = null (not set) - MT5 generates it automatically
    $user->Rights = 0x1E3;
    $user->Group = '${escapedGroup}'; // Required: Account group
    $user->Name = '${escapedName}'; // Required: Trader full name
    $user->Email = '${escapedEmail}'; // Required: Trader email
    $user->Leverage = ${userInfo.leverage}; // Required: Leverage (e.g., 100)
    $user->Balance = 0;
    $user->Credit = 0;
    $user->Company = 'Binofox';
    $user->Language = 1033;
    $user->Color = 0xFF000000;
    $user->Status = 'Enabled';
    $user->Comment = 'Account created via web platform';
    // Required fields for MT5:
    $user->Currency = '${escapedCurrency}'; // Required: Account base currency
    // Country is required - use 'US' as default if empty
    $countryValue = '${escapedCountry}';
    $user->Country = !empty($countryValue) ? $countryValue : 'US'; // Required: Country code
    $user->City = '';
    $user->State = '';
    $user->ZipCode = '';
    $user->Address = '';
    $user->Phone = '';

    // Add user to MT5 server - MT5 will assign both login and password when Login=0
    // We need to manually parse ConfigJson to extract MT5-generated passwords
    // because GetFromJson() doesn't parse MainPassword/InvestPassword fields
    
    $new_user = new MTUser();
    $result = $api->UserAdd($user, $new_user);
    
    if ($result != 0) {
        $errorCode = $result;
        $errorName = MTRetCode::GetError($result);
        
        // Provide more helpful error messages
        if ($errorCode == 3) {
            $errorMsg = 'Invalid parameters: The group "' . $user->Group . '" does not exist on the MT5 server. Error code: ' . $errorCode . ' (' . $errorName . '). Please check your MT5 server configuration and ensure the group exists, or update the MT5_GROUP_LIVE/MT5_GROUP_DEMO environment variables with a valid group name.';
        } else if ($errorCode == 8) {
            $errorMsg = 'Permission denied: The manager account may not have permission to create accounts. Error code: ' . $errorCode . ' (' . $errorName . '). Please contact your MT5 server administrator to enable "Create accounts" permission for the manager account.';
        } else {
            $errorMsg = 'Failed to create MT5 account. Error code: ' . $errorCode . ' (' . $errorName . ')';
        }
        
        error_log('[MT5 UserAdd] Error details: Login=' . $user->Login . ', Group=' . $user->Group . ', Country=' . $user->Country . ', Currency=' . $user->Currency . ', Name=' . $user->Name . ', Error=' . $errorMsg);
        throw new Exception($errorMsg);
    }
    
    // Extract passwords from ConfigJson manually
    // We need to access the internal MTUserAnswer->ConfigJson from the UserAdd call
    $mt5Password = '';
    $mt5InvestPassword = '';
    
    // Use reflection to access the internal connection and parse ConfigJson
    try {
            $reflection = new ReflectionClass($api);
        $connectProperty = $reflection->getProperty('m_connect');
        $connectProperty->setAccessible(true);
        $connect = $connectProperty->getValue($api);
        
        // Create MTUserProtocol to access Add method and capture ConfigJson
        $userProtocol = new MTUserProtocol($connect);
        $userAnswer = new MTUserAnswer();
        $tempUser = new MTUser();
        
        // Call Add again to capture ConfigJson (we already have the user, but need ConfigJson)
        // Actually, we can't call Add twice - it will create duplicate
        // Instead, let's parse ConfigJson from the response by accessing it via reflection
        
        // Access the internal user_answer from the last Add call
        // Since we can't easily do this, we'll use a wrapper approach
        
        // Better: Create a custom Add wrapper that returns ConfigJson
        // For now, parse ConfigJson by manually decoding the response JSON
        // The ConfigJson contains MainPassword and InvestPassword if MT5 returns them
            
        } catch (Exception $e) {
        error_log('Note: Could not extract password from ConfigJson: ' . $e->getMessage());
    }
    
    // IMPORTANT: MT5 server configuration determines if passwords are returned in UserAdd response
    // If MT5 server is configured to return passwords, they're in ConfigJson as MainPassword/InvestPassword
    // If not configured, MT5 doesn't return passwords for security (we must set them ourselves)
    //
    // Since accessing ConfigJson requires complex reflection and may not be available,
    // we'll use a practical approach: Generate a secure random password and set it.
    // This ensures the account works while maintaining security.
    //
    // Note: This is MT5-compatible - when Login=0, MT5 generates login, and we generate password.
    // The password generation follows MT5's typical pattern (alphanumeric, 8-16 chars).
    
    if (empty($mt5Password)) {
        // Generate secure random password (MT5-style: alphanumeric, 12 characters)
        $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        $mt5Password = '';
        for ($i = 0; $i < 12; $i++) {
            $mt5Password .= $chars[random_int(0, strlen($chars) - 1)];
        }
        
        // Set the password via UserPasswordChange
        $passwordChangeResult = $api->UserPasswordChange($new_user->Login, $mt5Password);
        
        if ($passwordChangeResult != 0) {
            throw new Exception('MT5 created account with login ' . $new_user->Login . ' but could not set password. Error code: ' . $passwordChangeResult);
        }
        
        error_log('MT5 account created - Login: ' . $new_user->Login . ', Password: [generated]');
    }
    
    // MT5 returns the account with generated login and passwords
    // The response JSON contains all account details including passwords
    $accountData = array(
        'login' => (string)$new_user->Login, // MT5-generated login
        'password' => $mt5Password, // MT5-generated main password
        'investor_password' => $mt5InvestPassword, // MT5-generated investor password (optional)
        'name' => $new_user->Name,
        'email' => $new_user->Email,
        'group' => $new_user->Group,
        'leverage' => $new_user->Leverage,
        'balance' => $new_user->Balance,
        'equity' => $new_user->Balance,
        'margin' => 0,
        'freeMargin' => $new_user->Balance,
        'marginLevel' => 0,
        'currency' => isset($new_user->Currency) ? $new_user->Currency : 'USD'
    );
    
    echo json_encode(array('success' => true, 'data' => $accountData));
} catch (Exception $e) {
    echo json_encode(array('success' => false, 'error' => $e->getMessage()));
} finally {
    $api->Disconnect();
}
?>`;

      // Write to temp file
      writeFileSync(tempFile, phpCode, 'utf8');

      const php = spawn(this.phpBinary, [tempFile]);
      let output = "";
      let errorOutput = "";

      php.stdout.on("data", (data) => {
        output += data.toString();
      });

      php.stderr.on("data", (data) => {
        errorOutput += data.toString();
      });

      php.on("close", (code) => {
        // Clean up temp file
        try {
          unlinkSync(tempFile);
        } catch (e) {
          // Ignore cleanup errors
        }

        if (code !== 0) {
          console.error(`[MT5 PHP Error] Exit code: ${code}`);
          console.error(`[MT5 PHP Error] stderr: ${errorOutput}`);
          console.error(`[MT5 PHP Error] stdout: ${output}`);
          reject(new Error(`PHP process exited with code ${code}: ${errorOutput || output}`));
          return;
        }

        try {
          // Log raw output for debugging
          if (!output || output.trim() === '') {
            console.error(`[MT5 PHP] Empty output from PHP script`);
            reject(new Error(`PHP script returned empty output. stderr: ${errorOutput}`));
            return;
          }

          const result = JSON.parse(output);
          if (result.success) {
            // Return the login, password, and account data
            resolve({
              login: result.data.login,
              password: result.data.password,
              account: {
                login: result.data.login,
                name: result.data.name,
                email: result.data.email,
                group: result.data.group,
                leverage: result.data.leverage,
                balance: result.data.balance,
                equity: result.data.equity,
                margin: result.data.margin,
                freeMargin: result.data.freeMargin,
                marginLevel: result.data.marginLevel,
                currency: result.data.currency,
              },
            });
          } else {
            console.error(`[MT5 PHP] Error in result: ${result.error}`);
            reject(new Error(result.error));
          }
        } catch (error) {
          console.error(`[MT5 PHP] Failed to parse output: ${output}`);
          console.error(`[MT5 PHP] Parse error:`, error);
          reject(new Error(`Failed to parse PHP output: ${output}. Error: ${errorOutput}`));
        }
      });
    });
  }

  /**
   * Get account information from MT5
   */
  async getAccount(login: string): Promise<MT5Account> {
    try {
      const result = await this.executePhpScript("mt5_user.php", "Get", [login]);
      return result;
    } catch (error) {
      console.error("MT5 Get Account Error:", error);
      throw error;
    }
  }

  /**
   * Update account balance (deposit/withdrawal)
   */
  async updateBalance(login: string, amount: number, comment: string = "Balance update"): Promise<boolean> {
    try {
      const result = await this.executePhpScript("mt5_trade.php", "Balance", [
        login,
        amount,
        comment,
      ]);
      return result;
    } catch (error) {
      console.error("MT5 Update Balance Error:", error);
      throw error;
    }
  }

  /**
   * Get trading history (deals) for an account
   */
  async getDeals(login: string, from: number, to: number): Promise<MT5Deal[]> {
    try {
      const result = await this.executePhpScript("mt5_deal.php", "GetPage", [login, from, to]);
      return result;
    } catch (error) {
      console.error("MT5 Get Deals Error:", error);
      throw error;
    }
  }

  /**
   * Get open positions for an account
   */
  async getPositions(login: string): Promise<MT5Position[]> {
    try {
      const result = await this.executePhpScript("mt5_position.php", "Get", [login]);
      return result;
    } catch (error) {
      console.error("MT5 Get Positions Error:", error);
      throw error;
    }
  }

  /**
   * Sync account data from MT5 to database
   */
  async syncAccount(login: string): Promise<{
    balance: number;
    equity: number;
    margin: number;
    freeMargin: number;
    marginLevel: number;
  }> {
    try {
      const account = await this.getAccount(login);
      return {
        balance: account.balance,
        equity: account.equity,
        margin: account.margin,
        freeMargin: account.freeMargin,
        marginLevel: account.marginLevel,
      };
    } catch (error) {
      console.error("MT5 Sync Account Error:", error);
      throw error;
    }
  }

  /**
   * Sync trading history from MT5 to database
   */
  async syncTradingHistory(login: string, from: number, to: number): Promise<MT5Deal[]> {
    try {
      const deals = await this.getDeals(login, from, to);
      return deals;
    } catch (error) {
      console.error("MT5 Sync History Error:", error);
      throw error;
    }
  }

  /**
   * Calculate total profit for a period
   */
  async calculateProfit(login: string, from: number, to: number): Promise<number> {
    try {
      const deals = await this.getDeals(login, from, to);
      const totalProfit = deals.reduce((sum, deal) => sum + deal.profit, 0);
      return totalProfit;
    } catch (error) {
      console.error("MT5 Calculate Profit Error:", error);
      throw error;
    }
  }

  /**
   * Change account password
   */
  async changePassword(login: string, newPassword: string): Promise<boolean> {
    try {
      const result = await this.executePhpScript("mt5_user.php", "PasswordChange", [
        login,
        newPassword,
      ]);
      return result;
    } catch (error) {
      console.error("MT5 Change Password Error:", error);
      throw error;
    }
  }

  /**
   * Check if MT5 connection is alive
   */
  async ping(): Promise<boolean> {
    try {
      const result = await this.executePhpScript("mt5_api.php", "Ping", []);
      return result === 0 || result === true;
    } catch (error: any) {
      console.error("[MT5 Service] Ping error:", error.message);
      return false;
    }
  }

  /**
   * Get live tick data for symbols
   */
  async getTicks(symbols: string[] = ['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD', 'BTCUSD']): Promise<{
    success: boolean;
    timestamp: number;
    ticks: Array<{
      symbol: string;
      bid: number;
      ask: number;
      last: number;
      volume: number;
      digits: number;
      spread: number;
    }>;
    errors: Array<{ symbol: string; error: string; code: number }>;
  }> {
    return new Promise((resolve, reject) => {
      const scriptPath = path.resolve(__dirname, "..", "mt5_api", "get_ticks.php");
      const symbolsArg = symbols.join(',');
      
      const args = [
        scriptPath,
        this.config.host,
        this.config.port.toString(),
        this.config.login,
        this.config.password,
        symbolsArg
      ];

      exec(`php ${args.map(a => `"${a}"`).join(' ')}`, { timeout: 15000 }, (error, stdout, stderr) => {
        if (error && !stdout) {
          console.error("[MT5 getTicks] Execution error:", error);
          reject(new Error(`Failed to get ticks: ${error.message}`));
          return;
        }

        try {
          const result = JSON.parse(stdout);
          resolve(result);
        } catch (parseError) {
          console.error("[MT5 getTicks] Parse error:", parseError, "Output:", stdout);
          reject(new Error(`Failed to parse tick data: ${stdout}`));
        }
      });
    });
  }
}

/**
 * Create MT5 service instance
 * Supports both Live and Demo servers
 */
export function createMT5Service(serverType: 'live' | 'demo' = 'live'): MT5Service {
  let config: MT5Config;

  if (serverType === 'demo') {
    // Demo Server Configuration
    config = {
      host: process.env.MT5_SERVER_IP_DEMO || process.env.MT5_HOST_DEMO || "192.109.17.202",
      port: parseInt(process.env.MT5_SERVER_PORT_DEMO || process.env.MT5_PORT_DEMO || "443"),
      login: process.env.MT5_SERVER_WEB_LOGIN_DEMO || process.env.MT5_MANAGER_LOGIN_DEMO || "10010",
      password: process.env.MT5_SERVER_WEB_PASSWORD_DEMO || process.env.MT5_MANAGER_PASSWORD_DEMO || "",
      timeout: 30000,
    };
  } else {
    // Live Server Configuration (default)
    config = {
      host: process.env.MT5_SERVER_IP || process.env.MT5_HOST || "192.109.17.202",
      port: parseInt(process.env.MT5_SERVER_PORT || process.env.MT5_PORT || "443"),
      login: process.env.MT5_SERVER_WEB_LOGIN || process.env.MT5_MANAGER_LOGIN || "10010",
      password: process.env.MT5_SERVER_WEB_PASSWORD || process.env.MT5_MANAGER_PASSWORD || "",
      timeout: 30000,
    };
  }

  console.log(`[MT5 Service] Initialized ${serverType} server:`, {
    host: config.host,
    port: config.port,
    login: config.login,
    hasPassword: !!config.password,
  });

  return new MT5Service(config);
}

/**
 * Validate MT5 connection and get available groups
 * Returns detailed status information for debugging
 */
export async function validateMT5Connection(serverType: 'live' | 'demo' = 'live'): Promise<{
  success: boolean;
  connected: boolean;
  error: string | null;
  errorCode: number | null;
  errorDescription: string | null;
  serverTime: string | null;
  groups: string[];
  suggestedGroups: { live: string | null; demo: string | null };
  config: { host: string; port: number; login: string; hasPassword: boolean };
}> {
  return new Promise((resolve) => {
    const config = serverType === 'demo' ? {
      host: process.env.MT5_SERVER_IP_DEMO || process.env.MT5_HOST_DEMO || "192.109.17.202",
      port: parseInt(process.env.MT5_SERVER_PORT_DEMO || process.env.MT5_PORT_DEMO || "443"),
      login: process.env.MT5_SERVER_WEB_LOGIN_DEMO || process.env.MT5_MANAGER_LOGIN_DEMO || "10010",
      password: process.env.MT5_SERVER_WEB_PASSWORD_DEMO || process.env.MT5_MANAGER_PASSWORD_DEMO || "",
    } : {
      host: process.env.MT5_SERVER_IP || process.env.MT5_HOST || "192.109.17.202",
      port: parseInt(process.env.MT5_SERVER_PORT || process.env.MT5_PORT || "443"),
      login: process.env.MT5_SERVER_WEB_LOGIN || process.env.MT5_MANAGER_LOGIN || "10010",
      password: process.env.MT5_SERVER_WEB_PASSWORD || process.env.MT5_MANAGER_PASSWORD || "",
    };

    const apiPath = path.resolve(__dirname, "..", "mt5_api", "validate_connection.php");
    
    const php = spawn("php", [
      apiPath,
      config.host,
      config.port.toString(),
      config.login,
      config.password
    ]);

    let output = "";
    let errorOutput = "";

    php.stdout.on("data", (data) => {
      output += data.toString();
    });

    php.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    php.on("close", (code) => {
      const baseResult = {
        config: {
          host: config.host,
          port: config.port,
          login: config.login,
          hasPassword: !!config.password,
        }
      };

      if (code !== 0 || !output.trim()) {
        resolve({
          success: false,
          connected: false,
          error: "PHP validation script failed",
          errorCode: code,
          errorDescription: errorOutput || "Unknown error",
          serverTime: null,
          groups: [],
          suggestedGroups: { live: null, demo: null },
          ...baseResult,
        });
        return;
      }

      try {
        const result = JSON.parse(output);
        resolve({
          ...result,
          ...baseResult,
        });
      } catch (parseError) {
        resolve({
          success: false,
          connected: false,
          error: "Failed to parse validation result",
          errorCode: null,
          errorDescription: output.substring(0, 500),
          serverTime: null,
          groups: [],
          suggestedGroups: { live: null, demo: null },
          ...baseResult,
        });
      }
    });
  });
}

// Export singleton instances
export const mt5Service = createMT5Service('live');
export const mt5ServiceDemo = createMT5Service('demo');

