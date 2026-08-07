import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Error from './Error';

test('renders Error without crashing', () => {
  render(
    <BrowserRouter>
      <Error theme={{ text: 'black', body: 'white', compImgHighlight: 'white', highlight: 'white', secondaryText: 'gray', imageHighlight: 'white' }} />
    </BrowserRouter>
  );
});
