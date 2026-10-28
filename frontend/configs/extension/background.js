chrome.action.onClicked.addListener(async (tab) => {
  try {
    await chrome.tabs.create({
      url: chrome.runtime.getURL('newtab.html'),
      active: true,
      ...(Number.isInteger(tab.windowId) ? { windowId: tab.windowId } : {}),
    });
  } catch (error) {
    console.error('Unable to open Glimmer:', error);
  }
});
