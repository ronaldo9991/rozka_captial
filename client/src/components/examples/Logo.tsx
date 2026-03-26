import Logo from '../Logo'

export default function LogoExample() {
  return (
    <div className="p-8 space-y-8">
      <Logo />
      <Logo showText={false} />
    </div>
  )
}
