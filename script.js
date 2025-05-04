$(document).ready(function() {
    // Define the base directory where your numbered folders (1, 2, 3...) reside
    const imageBaseDir = 'images';

    // ***** IMPORTANT: SET THIS VALUE *****
    // Set this to the highest number used for your folder names.
    // For example, if your folders are named '1', '2', '3', set this to 3.
    // If your folders go up to '25', set this to 25.
    const totalNumberOfFolders = 10; // <<< --- CHANGE THIS TO MATCH YOUR HIGHEST FOLDER NUMBER ---
    // ************************************

    const $container = $('#comic-strips-container');
    $container.empty(); // Clear the "Loading ART..." message or any previous content

    // Basic validation
    if (typeof totalNumberOfFolders !== 'number' || totalNumberOfFolders <= 0) {
        $container.html('<p class="error-message" style="color: red; text-align: center; font-family: Bangers, cursive; font-size: 1.5rem;">Error: Please set a valid number for totalNumberOfFolders in script.js (must be greater than 0).</p>');
        console.error("Invalid totalNumberOfFolders value in script.js:", totalNumberOfFolders);
        return; // Stop execution if the number isn't valid
    }

    // Loop through each folder number from 1 up to the total specified
    for (let folderNumber = 1; folderNumber <= totalNumberOfFolders; folderNumber++) {

        // Create a container div for the entire row (a single 4-panel strip)
        const $row = $('<div class="comic-strip-row"></div>');

        // Generate the 4 panels for the current row
        // Assumes images inside each folder are named 1.png, 2.png, 3.png, 4.png
        for (let panelNumber = 1; panelNumber <= 4; panelNumber++) {

            // Construct the image filename (e.g., "1.png", "2.png")
            const imageName = `${panelNumber}.png`;

            // Construct the full path to the image file
            // e.g., "images/1/1.png", "images/1/2.png", ... "images/2/1.png", etc.
            const imagePath = `${imageBaseDir}/${folderNumber}/${imageName}`;

            // Create a container div for the individual panel
            const $panel = $('<div class="comic-panel"></div>');

            // Create the image HTML element
            const $img = $('<img>')
                .attr('src', imagePath)
                // Set descriptive alt text for accessibility
                .attr('alt', `Panel ${panelNumber} of strip ${folderNumber}`);

            // Add error handling: If an image fails to load, display a message
            // inside its panel instead of showing a broken image icon.
            $img.on('error', function() {
                console.error("Failed to load image:", imagePath);
                // Replace the image with an error message inside the panel
                // Apply the .img-error class to the panel for styling
                $(this).parent() // Get the parent .comic-panel div
                   .addClass('img-error')
                   .html(`<span>Image not found:<br>${folderNumber}/${imageName}</span>`); // Display which image failed
            });

            // Add the image element to its panel container
            $panel.append($img);

            // Add the completed panel to the row container
            $row.append($panel);
        } // End of panel loop (panels 1-4)

        // Add the completed row (with its 4 panels) to the main content container on the page
        $container.append($row);

    } // End of folder loop (folders 1 to totalNumberOfFolders)

    // Check if any rows were actually added. If totalNumberOfFolders was valid but > 0,
    // this might indicate an issue if the container is still empty (though unlikely with the loop structure).
    if ($container.children().length === 0 && totalNumberOfFolders > 0) {
         $container.html('<p class="error-message" style="text-align: center;">No comic strips were generated. Please check folder numbers and image paths.</p>');
    }


}); // End of $(document).ready()
