export interface WalletProvider {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  iconSrc?: string;
  disabled?: boolean;
}
