export default class KeyBind {
  constructor(config, emitter) {
    let lastEvent;
    document.addEventListener('keydown', event => {
      switch (event.key) {
        case 'i':
          event.preventDefault();
          emitter('openTweetModal');
          break;
        case 'j':
          this.prevTweet(event);
          break;
        case 'k':
          this.nextTweet(event);
          break;
        case 'g':
          if (event.timeStamp < lastEvent.timeStamp + 500 && lastEvent.key === 'g') {
            this.scrollToTop(event);
          }
          break;
        case 'G':
          this.scrollToBottom(event);
          break;
        default:
      }
      lastEvent = event;
    });
  }

  prevTweet(event) {
    event.preventDefault();
  }

  nextTweet(event) {
    event.preventDefault();
  }

  scrollToTop(event) {
    event.preventDefault();
    document.querySelector('#root').scrollIntoView({behavior: 'smooth', block: 'start'});
  }

  scrollToBottom(event) {
    event.preventDefault();
    document.querySelector('#root').scrollIntoView({behavior: 'smooth', block: 'end'});
  }
}
