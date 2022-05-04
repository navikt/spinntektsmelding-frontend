import styles from './LabelLabel.module.css';

interface LabelLabelProps {
  size?: 'small' | 'medium';
  children?: React.ReactNode;
  htmlFor?: string;
  className?: string;
}

export default function LabelLabel(props: LabelLabelProps) {
  const size = props.size || 'medium';
  const theClassName = props.className || '';

  return (
    <label
      htmlFor={props.htmlFor}
      className={`navds-text-field__label navds-label navds-label--${size} ${styles.labellabel} ${theClassName}`}
    >
      {props.children}
    </label>
  );
}
