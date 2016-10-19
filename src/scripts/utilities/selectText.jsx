// Selects element text by ID
function selectText(id) {
    var element = document.getElementById(id)

    var range = document.createRange();
    range.selectNodeContents(element);

    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
}

export default selectText;
