import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Educations from './Educations';

test('renders Educations without crashing', () => {
  render(
    <BrowserRouter>
      <Educations theme={{ text: 'black', body: 'white' }} pullRequest={{ url: '', title: '' }} github={{}} />
    </BrowserRouter>
  );
});
