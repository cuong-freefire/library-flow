import { render, screen } from '@testing-library/react';
import App from './App';

test('renders library home page', () => {
  render(<App />);
  expect(screen.getByText(/Library Flow/i)).toBeInTheDocument();
  expect(screen.getByText(/Xem danh mục sách/i)).toBeInTheDocument();
});
