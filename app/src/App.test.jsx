import React from 'react';
import { render } from '@testing-library/react';

import App from './App.jsx';

describe('<App />', () => {
  it('Gets renderer properly', () => {
    const { getByText } = render(<App />);
    expect(getByText(/^Hello App!$/)).toBeInTheDocument();
  });
});
