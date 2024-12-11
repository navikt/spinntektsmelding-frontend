import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
// import '@testing-library/vi-dom';

import useSendInnFeedback from '../../utils/useSendInnFeedback';
import FlexJarResponse from '../../components/FlexJarResponse/FlexJarResponse';

vi.mock('../../utils/useSendInnFeedback');

describe('FlexJarResponse', () => {
  const mockSendInnFeedback = vi.fn();
  useSendInnFeedback.mockReturnValue(mockSendInnFeedback);

  const defaultProps = {
    feedbackId: 'test-feedback-id',
    sporsmaal: 'Er du fornøyd med tjenesten?',
    sporsmaalFeedback: 'Hva likte du?',
    sporsmaalFeedbackNei: 'Hva kan vi forbedre?'
  };

  beforeEach(() => {
    mockSendInnFeedback.mockClear();
  });

  it('renders question and buttons', () => {
    render(<FlexJarResponse {...defaultProps} />);
    expect(screen.getByText('Er du fornøyd med tjenesten?')).toBeInTheDocument();
    expect(screen.getByText('Ja')).toBeInTheDocument();
    expect(screen.getByText('Nei')).toBeInTheDocument();
  });

  it('shows feedback textarea when "Ja" is clicked', () => {
    render(<FlexJarResponse {...defaultProps} />);
    fireEvent.click(screen.getByText('Ja'));
    expect(screen.getByLabelText('Hva likte du?')).toBeInTheDocument();
  });

  it('shows feedback textarea when "Nei" is clicked', () => {
    render(<FlexJarResponse {...defaultProps} />);
    fireEvent.click(screen.getByText('Nei'));
    expect(screen.getByLabelText('Hva kan vi forbedre?')).toBeInTheDocument();
  });

  it('shows feedback textarea when "Nei" is clicked', () => {
    render(<FlexJarResponse {...defaultProps} sporsmaalFeedbackNei={undefined} />);
    fireEvent.click(screen.getByText('Nei'));
    expect(screen.getByLabelText('Hva likte du?')).toBeInTheDocument();
  });

  it('sends feedback when "Send tilbakemelding" is clicked', () => {
    render(
      <FlexJarResponse
        {...defaultProps}
        sporsmaalFeedback={
          <>
            <strong>Hva likte du?</strong>
            <i>Aller best!</i>
          </>
        }
      />
    );
    fireEvent.click(screen.getByText('Ja'));
    fireEvent.change(screen.getByLabelText(/Hva likte du?/), { target: { value: 'Great service!' } });
    fireEvent.click(screen.getByText('Send tilbakemelding'));
    expect(mockSendInnFeedback).toHaveBeenCalledWith({
      svar: 'Ja',
      feedbackId: 'test-feedback-id',
      sporsmal: 'Er du fornøyd med tjenesten?',
      sporsmalFeedback: 'Hva likte du?Aller best!',
      feedback: 'Great service!',
      app: 'spinntektsmelding-frontend'
    });
    expect(screen.getByText('Vi setter pris på din tilbakemelding!')).toBeInTheDocument();
  });

  it('shows thank you message after feedback is sent', () => {
    render(<FlexJarResponse {...defaultProps} />);
    fireEvent.click(screen.getByText('Ja'));
    fireEvent.change(screen.getByLabelText('Hva likte du?'), { target: { value: 'Great service!' } });
    fireEvent.click(screen.getByText('Send tilbakemelding'));
    expect(screen.getByText('Vi setter pris på din tilbakemelding!')).toBeInTheDocument();
  });

  it('sends feedback when "Send tilbakemelding" is clicked, stripping away html', () => {
    render(<FlexJarResponse {...defaultProps} />);
    fireEvent.click(screen.getByText('Ja'));
    fireEvent.change(screen.getByLabelText('Hva likte du?'), { target: { value: 'Great service!' } });
    fireEvent.click(screen.getByText('Send tilbakemelding'));
    expect(mockSendInnFeedback).toHaveBeenCalledWith({
      svar: 'Ja',
      feedbackId: 'test-feedback-id',
      sporsmal: 'Er du fornøyd med tjenesten?',
      sporsmalFeedback: 'Hva likte du?',
      feedback: 'Great service!',
      app: 'spinntektsmelding-frontend'
    });
    expect(screen.getByText('Vi setter pris på din tilbakemelding!')).toBeInTheDocument();
  });
});
