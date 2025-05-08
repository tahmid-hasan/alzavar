const issues = [];

function warn(el) {
  // Style the detected issues
  el.style.outline = '2px solid #FFCC00';
  el.style.backgroundColor = '#FFCC00';
  el.style.backgroundImage  = 'linear-gradient(135deg, rgba(255,0,0,1) 0%, rgba(255,204,0,1) 35%, rgba(0,212,255,1) 100%)';
}

function checkScrollingAncestor(elem) {
    if (!elem.parentElement || elem.parentElement.tagName.toLowerCase() === 'body') {
        return false;
    }

    const computedStyle = window.getComputedStyle(elem.parentElement);

    if (computedStyle.overflowX == 'auto') {
        return true;
    } else {
        return checkScrollingAncestor(elem.parentElement);
    }
}

function getSizedAncestor(elem) {
    if (!elem.parentElement) {
        return null;
    }

    if (elem.parentElement.offsetWidth > 0) {
        return elem.parentElement;
    } else {
        return getSizedAncestor(elem.parentElement);
    }
}

function checkElement(el) {
    const hasScrollingAncestor = checkScrollingAncestor(el);
    if (hasScrollingAncestor) {
        return;
    }

    // Find elements that overflow the document width
    if (el.offsetWidth > document.documentElement.offsetWidth) {
        warn(el);
        issues.push(el);
    }

    const ancestor = getSizedAncestor(el);
    const info = window.getComputedStyle(el);

    // Find any negative margins (deliberate outflow)
    const adjustment = 
        (info.marginLeft.startsWith('-') ? parseFloat(info.marginLeft) * -1 : 0)
        +
        (info.marginRight.startsWith('-') ? parseFloat(info.marginRight) * -1 : 0);

    if (ancestor && (el.offsetWidth - adjustment) > ancestor.offsetWidth) {
      warn(el);
      issues.push(el);
    }
}

document.querySelectorAll('*').forEach(checkElement);

issues.length > 0 && issues[0].scrollIntoView();
console.log(issues);