import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./BoxShelfVisualiser', () => ({ __esModule: true, default: () => null, SHEET_WIDTH: 244, SHEET_HEIGHT: 122 }));
jest.mock('./ShelfVisualizer', () => ({ __esModule: true, default: () => null }));

test('renders the app header and builder switcher', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /shelf builder/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /box shelf/i })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByRole('button', { name: /slotted shelf/i })).toHaveAttribute('aria-pressed', 'false');
});
