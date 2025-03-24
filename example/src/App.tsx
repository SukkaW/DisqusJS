import { StrictMode } from 'react';
import { DisqusJS } from '../../src';

export function App() {
  return (
    <StrictMode>
      <DisqusJS
        shortname="sukas-blog"
        siteName="Sukka's Blog · 苏卡卡的博客"
        identifier="https://suka.js.org/DisqusJS/"
        url="https://suka.js.org/DisqusJS/"
        api="https://disqus.skk.moe/disqus/"
        apikey="G2amHmorq3wJVjaviRo3YNWPgsKkAm7IolUWQKLeyQNd7lb3GtgWNnh6RgFFIwO9"
        admin="SukkaW"
        adminLabel="苏卡卡~"
      />
    </StrictMode>
  );
}
