import styles from './TextLabel.module.css';

interface TextLabelProps {
  size?: 'small' | 'medium';
  children?: React.ReactNode;
  className?: string;
}

export default function TextLabel(props: TextLabelProps) {
  const size = props.size || 'medium';
  const theClassName = props.className || '';

  return (
    <div className={`navds-text-field__label navds-label navds-label--${size} ${styles.textlabel} ${theClassName}`}>
      {props.children}
    </div>
  );
}
