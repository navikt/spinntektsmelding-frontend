import { render, screen } from '@testing-library/react';
import { useForm, FormProvider } from 'react-hook-form';
import OrdinaryJaNei from '../../components/OrdinaryJaNei/OrdinaryJaNei';
// import OrdinaryJaNei from './OrdinaryJaNei';

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm();
  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('OrdinaryJaNei', () => {
  it('renders the component with given legend and name', () => {
    render(
      <Wrapper>
        <OrdinaryJaNei legend='Test Legend' name='testName' />
      </Wrapper>
    );

    expect(screen.getByText('Test Legend')).toBeInTheDocument();
    expect(screen.getByLabelText('Ja')).toBeInTheDocument();
    expect(screen.getByLabelText('Nei')).toBeInTheDocument();
  });
});
