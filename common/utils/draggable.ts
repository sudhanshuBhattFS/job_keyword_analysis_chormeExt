export function dragElement(ele) {
  var pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;

  if (document.getElementById(ele.id + "job-keyword-analysis-popup")) {
    const header = document.getElementById(
      ele.id + "job-keyword-analysis-popup"
    );
    if (header) {
      header.onmousedown = dragMouseDown;
    }
  } else {
    ele.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    // avoiding drag in some specific elements for better UX
    if (
      e.target.tagName != "INPUT" &&
      e.target.tagName != "TEXTAREA" &&
      e.target.tagName != "SELECT" &&
      e.target.tagName != "LABEL" &&
      e.target.tagName != "BUTTON" &&
      e.target.tagName != "I"
    ) {
      e = e || window.event;
      e.preventDefault();
      // get the mouse cursor position at startup:
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
    } else {
      e.target.focus();
    }
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    ele.style.top = ele.offsetTop - pos2 + "px";
    ele.style.left = ele.offsetLeft - pos1 + "px";
  }

  function closeDragElement() {
    /* stop moving when mouse button is released:*/
    document.onmouseup = null;
    document.onmousemove = null;
  }
}
