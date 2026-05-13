import { render, screen } from '@testing-library/react';
import App from './App';

test('renders eco-smart classifier interface', () => {
  render(<App />);

  expect(screen.getByText(/Eco-Smart Classifier/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Prediction/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Assistant NLP/i })).toBeInTheDocument();
});
