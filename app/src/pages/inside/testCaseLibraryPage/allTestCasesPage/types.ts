export interface DotsMenuItem {
  label: string;
  value: string;
  hidden?: boolean;
  disabled?: boolean;
  title: string;
  onClick: VoidFunction;
  type?: 'danger' | 'separator';
}
