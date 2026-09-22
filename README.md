# Decide For Me

## Original Idea

I want to create a spinning wheel for people who struggle to make decisions and want to make small everyday choices more quickly. When someone clicks a button, the wheel should spin and randomly land on one of the available options.

# Install and Run

A local spinning wheel for resolving small everyday choices. No external services or dependencies.

## Files

- `index.html` — page structure; links to the two files below.
- `style.css` — colors, layout, and responsive styling.
- `script.js` — option editing, browser-generated randomness, and animated spins.

## Download ZIP (recommended)

Keep `index.html`, `style.css`, and `script.js` together in the same folder. **Downloading only `index.html` is not enough**. After downloading, the app works offline.

1. Open this project's GitHub repository page.
2. Click the green **Code** button, then **Download ZIP**.
3. Extract the ZIP: on Windows, right-click it and select **Extract All**; on macOS, double-click it.
4. Open the extracted project folder, double-click `index.html`, or right-click it and select **Open with → your web browser**.

### Clone with Git (alternative to ZIP)

**Git must be installed**. 

1. Open a terminal in the folder where you want to store the project. On Windows, open that folder in File Explorer, type `powershell` in the address bar, and press **Enter**.
2. Run:

```powershell
git clone https://github.com/RuiqiiLiu/Activity-Decision-Wheel.git
cd Activity-Decision-Wheel
```

3. Open the newly created `Activity-Decision-Wheel` folder and double-click `index.html` to run the app.

To download later updates into an existing clone, run `git pull` inside its folder after committing your local changes.

## Use and Edit

The wheel starts empty. Select **Add another option**, type a choice, and add more as needed. Blank options disappear when you leave their text box. **Clear all** removes all options. A single filled option can spin; add more for a choice between alternatives.

Select **Custom percentages** to set an option’s chance from 0% to 100% (up to two decimal places). Leave other percentages blank on **Auto** to share the remainder. For example, 60% for one option and two Auto options gives chances of 60%, 20%, and 20%. If every percentage is entered, they must total 100%. An option at 0% cannot win. Invalid totals disable spinning until corrected.

Enter or edit options, add more if needed, and select **Spin the wheel**. The result appears after the wheel finishes spinning. Chances are equal by default; optional custom percentages change both the slice sizes and selection odds. Repeats are possible. Editing is paused during a spin to keep the displayed wheel and result in sync.

## AI use: `Codex`

### Prompt:

1. Create a spinning wheel for people who struggle to make small everyday decisions. The user should be able to enter several options, then click a button to spin the wheel. The wheel should spin for a few seconds and randomly stop on one option. Use one index.html with CSS and JavaScript inside it. No external services. Open the result in Codex’s built-in Browser (@Browser). Start a local preview server if needed. Update README.md with how to run it.
2. When I have the same options, the answer I get is always the same from the spinner. I expect every time the decisions should be random. Also, the decision made section should actually match what is shown in the spinner. Be sure to use one index.html with CSS and JavaScript inside it. No external services. Show the updated version in the same Codex Browser tab. 
3. I expected every word inside the spinning wheel to go in the same direction, all should be facing the center. Also I expected if nothing is being typed to the new option, atomically delete the blank text box, right now it just leaves blank there and I can click the add another option button to make new options with nothing inside forever. Keep the rest intact. Show the updated version in the same Codex Browser tab. 
4. Rather than keep at least two choices on the wheel, start with an empty wheel. Add a "clear" option that is able to quickly clear all the existing options. Add a custom percentage setting if the audience wants one or more options to take more percentages. Keep the rest intact. Show the updated version in the same Codex Browser tab. 

## Reflection

From the beginning, Codex understood the main functions I wanted very well. Users can add or remove their own options, and at the same time, the wheel will automatically update. When the user clicks the spin button, the wheel spins for a few seconds, stops on a random option, and displays the result. The overall layout also matched my intention because it was easy to understand how to use the page. However, the original visual style is not what I wanted. It used too many bright colors, which made the page feel busy. I also noticed several problems with the text on the wheel: some options appeared upside down or faced different directions, the font was too small, and longer sentences were cut off instead of wrapping. Then I started to test the basic spinning function and found out that the option the wheel landed on did not match the result shown in text. Also, spinning the same set of options three to five times often gave me the same result repeatedly. Since randomness and one final result are the main purposes of a decision wheel, I asked Codex to fix these issues first. After that, I changed the text direction and size, and adjusted the page to use calmer colors. After that I tested both adding and deleting options. Originally, adding an option without typing anything would leave an empty input box on the page, but I decided to change this so that unused empty options are automatically removed to keep the interface clean.

AI helped me turn a short description of my idea into a working structure, write the code, and fix problems I found during testing. However, I still had to decide whether what AI created actually matched my intention and whether the experience made sense for a user. For example, as I continued developing the project, I decided to add a “Clear All” button so users could quickly remove the old set of options, starting a blank new wheel. As well as a custom probability feature for users who want certain choices to have a higher chance of being selected. When I gave AI these ideas, it also helped me to improve them. For example, it added an “Auto” setting for percentages so users do not have to manually calculate every option to make the total equal 100%. Through this process, I realized that the most important part was still knowing what I wanted and being able to identify what needed to change, while AI was useful for helping me find ways to implement and improve those ideas. One thing that remains uncertain is the randomness of the wheel. Even with five to seven options that all have equal probability, I sometimes get the same result several times within three to five spins. I am still not sure whether this is a problem with the randomization in the code or simply something that can naturally happen with random results.
