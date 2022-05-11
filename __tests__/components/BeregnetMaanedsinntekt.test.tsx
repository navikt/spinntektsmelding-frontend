import { render, screen } from '@testing-library/react';
import BeregnetMaanedsinntekt from '../../components/BeregnetMaanedsinntekt/BeregnetMaanedsinntekt';
import '@testing-library/jest-dom';

describe('BeregnetMaanedsinntekt', () => {
  it('renders a title text', () => {
    const callback = jest.fn();
    render(
      <div className='main-content'>
        <BeregnetMaanedsinntekt
          maanedsinntekt={1234}
          maaned1sum={1234}
          maaned2sum={1234}
          maaned3sum={1234}
          maaned1navn='Januar'
          maaned2navn='Februar'
          maaned3navn='Mars'
          open={true}
          onClose={callback}
        />
      </div>
    );

    const buttonTitle = screen.getByRole('button', {
      name: /Bekreft/i
    });

    expect(buttonTitle).toBeInTheDocument();
  });
});
