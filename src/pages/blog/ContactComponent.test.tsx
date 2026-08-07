// @ts-nocheck
import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Contact from './ContactComponent';

test('renders Contact without crashing', () => {
  render(
    <BrowserRouter>
      <Contact theme={{ text: 'black', body: 'white' }} pullRequest={{ url: '', title: '' }} github={{}} />
    </BrowserRouter>
  );
});
