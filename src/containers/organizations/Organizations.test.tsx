import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Organizations from './Organizations';

test('renders Organizations without crashing', () => {
  render(
    <BrowserRouter>
      <Organizations theme={{ text: 'black', body: 'white' }} pullRequest={{ url: '', title: '' }} github={{}} />
    </BrowserRouter>
  );
});
