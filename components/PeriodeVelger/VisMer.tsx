interface VisMerProps {
  onClick?: () => void;
}

export default function VisMer(props: VisMerProps) {
  const clickHandler = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    if (props.onClick) props.onClick();
  };

  return (
    <button
      type='button'
      className='navds-read-more__button navds-body-short'
      aria-expanded='false'
      onClick={clickHandler}
    >
      <svg
        width='1em'
        height='1em'
        viewBox='0 0 24 24'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        focusable='false'
        role='img'
        className='navds-read-more__expand-icon'
        aria-hidden='true'
      >
        <path
          fillRule='evenodd'
          clipRule='evenodd'
          d='M5.97 9.47a.75.75 0 0 1 1.06 0L12 14.44l4.97-4.97a.75.75 0 1 1 1.06 1.06l-5.5 5.5a.75.75 0 0 1-1.06 0l-5.5-5.5a.75.75 0 0 1 0-1.06Z'
          fill='currentColor'
        ></path>
      </svg>
      <span>Vis mer...</span>
    </button>
  );
}
