import { render, screen, fireEvent } from '@testing-library/react';
import ChatWizard from '../components/ChatWizard';

// Mock Supabase client
jest.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({ select: jest.fn() })),
    })),
  },
}));

describe('ChatWizard', () => {
  it('renders the first question and proceeds to the next', () => {
    render(<ChatWizard />);
    // First question: City or ZIP code
    expect(screen.getByText(/City or ZIP code/i)).toBeInTheDocument();

    const input = screen.getByPlaceholderText(/City or ZIP code/i);
    fireEvent.change(input, { target: { value: '10001' } });
    fireEvent.click(screen.getByText(/Continue/i));

    // Next question: Brand flag
    expect(screen.getByText(/Brand flag/i)).toBeInTheDocument();
  });
}); 