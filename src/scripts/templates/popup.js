const create = (content) => {
    const popup = document.createElement('div');

    popup.id = 'alcss-container';
    popup.innerHTML = `
        <div class="alcss-content"><h1 class="alcss-title">Critical Snapshot</h1>
            <p id="alcss-output-css">
                ${ content }
            </p>
            <div id="alcss-buttons">
                <button type="button" class="alcss-button" id="alcss__copy">Copy</button>
                <button type="button" class="alcss-button" id="alcss__preview">Preview</button>
                <button type="button" class="alcss-button" id="alcss__close">Close</button>
                <button type="button" class="alcss-button" id="alcss__media">Show @media queries</button>
            </div>
        </div>
    `;

    return popup;
};

export default create;
