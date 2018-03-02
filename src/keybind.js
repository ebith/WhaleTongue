export default class KeyBind {
  constructor() {
    let lastEvent;
    document.addEventListener('keydown', event => {
      switch (event.key) {
        case 'i':
          this.openInput(event);
        case 'j':
          this.prevTweet(event);
          break;
        case 'k':
          this.nextTweet(event);
          break;
        case 'g':
          if (event.timeStamp < lastEvent.timeStamp + 500) {
            this.scrollToTop(event);
          }
          break;
        case 'G':
          this.scrollToBottom(event);
          break;
      }
      lastEvent = event;
    });
  }
  openInput(event) {
    event.preventDefault();
  }
  prevTweet(event) {
    event.preventDefault();
  }
  nextTweet(event) {
    event.preventDefault();
  }
  scrollToTop(event) {
    event.preventDefault();
    document.querySelector('#root').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  scrollToBottom(event) {
    event.preventDefault();
    document.querySelector('#root').scrollIntoView({ behavior: 'smooth', block: 'end' });
  }
}
