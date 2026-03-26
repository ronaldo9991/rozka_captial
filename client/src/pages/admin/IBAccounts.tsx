import AccountTypePage from "./AccountTypePage";

export default function IBAccounts() {
  return (
    <AccountTypePage
      title="IB Accounts"
      description="Following is the list of IB Accounts:"
      accountType="IB"
      showReferralLink={true}
      showIBDetails={true}
    />
  );
}

