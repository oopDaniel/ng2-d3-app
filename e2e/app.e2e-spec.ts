import { D3appPage } from './app.po';

describe('d3app App', function() {
  let page: D3appPage;

  beforeEach(() => {
    page = new D3appPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
