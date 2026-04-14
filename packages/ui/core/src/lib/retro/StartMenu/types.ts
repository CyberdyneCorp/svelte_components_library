export interface StartMenuItem {
  id: string;
  label: string;
  icon?: string;
  onSelect?: () => void;
  disabled?: boolean;
}
