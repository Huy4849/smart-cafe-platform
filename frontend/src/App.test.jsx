import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login page', () => {
  render(<App />);
  const loginButton = screen.getByRole('button', { name: /đăng nhập hệ thống/i });
  expect(loginButton).toBeInTheDocument();
});
