import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TalkCard from './TalkCard';

test('renders TalkCard without crashing', () => {
  render(
    <BrowserRouter>
      <TalkCard theme={{ text: 'black', body: 'white', compImgHighlight: 'white', highlight: 'white', secondaryText: 'gray', imageHighlight: 'white' }} talkDetails={{ title: 'test', subtitle: 'test', slides_url: '', event_url: '', image: '' }} />
    </BrowserRouter>
  );
});
