import Button from '../buttons/Button';
import Icon from '../icons/Icon';
import useRiv from '~/hooks/useRiv';

interface DarkModeToggleProps {
  className?: string;
}

export default function DarkModeToggle({ className }: DarkModeToggleProps) {
  const { state, dispatch } = useRiv();
  const isDark = !!state.isDarkMode;

  const handleClick = () => {
  dispatch({ type: 'toggleDarkMode' });
  };

  return (
    <span className={className}>
      <Button onClick={handleClick} variant="icon" color={isDark ? 'warning' : 'secondary'}>
        <Icon name={isDark ? "moon" : "sun"} />
      </Button>
    </span>
  );
}
