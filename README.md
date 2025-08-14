# College Football Pick 'em app

This is a React app that works in conjunction with a Google Sheet to run a College Football pick contest.  The contest works like this:
* Administrators select games for the contest at the start of each week.  Generally marquee matchups are selected.
* Players submit their picks via this app on the "Picks" page.
* Those picks are recorded in the Google Sheet and reflected on the Leaderboard tab in the app.
* On game days, the scores will be updated automatically and players can check the Leaderboard for their latest points.

Points are awarded as follows:
* Each game pick is one of the following:  HOME, AWAY, OVER, UNDER
* Points are awarded if your pick beats the associated spread or over / under.
* Example matchup:  Ohio State (-14.5) @ Michigan (14.5) with O/U of 43.5
* Scenario 1:  Ohio State wins 55-3.  If you picked AWAY, you covered the spread by 52 - 14.5 and would get 37.5 points.
* Scenario 2:  Michigan wins 21-20.  If you picked UNDER, you covered the O/U by 43.5 - 41 and would get 1.5 points.
* Scenario 2:  Ohio State wins 17-14.  If you picked AWAY, you DID NOT cover the 14.5 spread and get 0 points.

General command flow to deploy changes
* git add . // adds any new files created
* git commit -m "Change description"
* git push
* npm run deploy

# React info for reference
## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
