/// <reference types="vitest/globals" />
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

const createStorageMock = () => {
  const values = new Map<string, string>();

  return {
    getItem: (key: string): string | null => values.get(key) ?? null,
    setItem: (key: string, value: string): void => {
      values.set(key, value);
    },
    removeItem: (key: string): void => {
      values.delete(key);
    },
    clear: (): void => {
      values.clear();
    },
  };
};

const resetApp = (): void => {
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: createStorageMock(),
  });
  window.history.pushState({}, '', '/');
};

describe('Presto UI', () => {
  beforeEach(() => {
    resetApp();
  });

  it('handles the required happy path for auth, presentation management, and slide navigation', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Register' }));
    await user.type(screen.getByLabelText('Name'), 'Alex Admin');
    await user.type(screen.getByLabelText('Email'), 'alex@example.com');
    await user.type(screen.getByLabelText('Password'), 'secret123');
    await user.type(screen.getByLabelText('Confirm password'), 'secret123');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByRole('heading', { name: 'Your presentations' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'New presentation' }));
    await user.type(screen.getByLabelText('Name'), 'Sprint Deck');
    await user.type(screen.getByLabelText('Description'), 'Weekly status');
    await user.type(screen.getByLabelText('Thumbnail URL or data URL'), 'https://example.com/thumb.png');
    await user.click(screen.getByRole('button', { name: 'Create' }));

    expect(await screen.findByRole('heading', { name: 'Sprint Deck' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Edit details' }));
    const nameInput = screen.getByLabelText('Name');
    await user.clear(nameInput);
    await user.type(nameInput, 'Quarterly Review');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByRole('heading', { name: 'Quarterly Review' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Add slide' }));
    expect(await screen.findByText('2')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Previous slide' }));
    expect(await screen.findByText('1')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Next slide' }));
    expect(await screen.findByText('2')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Delete presentation' }));
    await user.click(screen.getByRole('button', { name: 'Yes' }));

    expect(await screen.findByRole('heading', { name: 'Your presentations' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Logout' }));
    expect(await screen.findByRole('button', { name: 'Login' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Login' }));
    await user.type(screen.getByLabelText('Email'), 'alex@example.com');
    await user.type(screen.getByLabelText('Password'), 'secret123');
    await user.click(screen.getByRole('button', { name: 'Login' }));

    expect(await screen.findByRole('heading', { name: 'Your presentations' })).toBeInTheDocument();
  });

  it('covers an alternate path with elements, background editing, and validation errors', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Register' }));
    await user.type(screen.getByLabelText('Name'), 'Jamie Designer');
    await user.type(screen.getByLabelText('Email'), 'jamie@example.com');
    await user.type(screen.getByLabelText('Password'), 'secret123');
    await user.type(screen.getByLabelText('Confirm password'), 'secret123');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    await user.click(screen.getByRole('button', { name: 'New presentation' }));
    await user.type(screen.getByLabelText('Name'), 'Design Notes');
    await user.click(screen.getByRole('button', { name: 'Create' }));

    await user.click(screen.getByRole('button', { name: 'Add text' }));
    await user.clear(screen.getByLabelText('Text'));
    await user.type(screen.getByLabelText('Text'), 'Hello deck');
    await user.click(screen.getByRole('button', { name: 'Add element' }));

    expect(await screen.findByText('Hello deck')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Add code' }));
    await user.clear(screen.getByLabelText('Code'));
    await user.type(screen.getByLabelText('Code'), 'def greet():\n    return "hi"');
    await user.click(screen.getByRole('button', { name: 'Add element' }));

    expect(await screen.findByText(/def/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Backgrounds' }));
    await user.selectOptions(screen.getByLabelText('Current slide style'), 'custom');
    await user.selectOptions(screen.getByLabelText('Current slide background type'), 'gradient');
    await user.clear(screen.getByLabelText('Current slide value'));
    await user.type(
      screen.getByLabelText('Current slide value'),
      'linear-gradient(135deg, #111111, #555555)',
    );
    await user.click(screen.getByRole('button', { name: 'Save background settings' }));

    await waitFor(() => {
      const canvas = screen.getByText('1').closest('div');
      expect(canvas).toBeTruthy();
    });

    await user.click(screen.getByRole('button', { name: 'Slide panel' }));
    expect(await screen.findByRole('button', { name: /Slide 1/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Slide 1/i }));

    await user.click(screen.getByRole('button', { name: 'Delete slide' }));
    expect(
      await screen.findByText('Delete the presentation instead of removing its only slide.'),
    ).toBeInTheDocument();

    const textBlock = screen.getByText('Hello deck');
    fireEvent.contextMenu(textBlock);
    expect(await screen.findByText('Element deleted.')).toBeInTheDocument();
  });
});
