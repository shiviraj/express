const moment = require('moment');
const statusCodes = require('./statusCodes.json');

const logRequest = function (req, res, next) {
  if (!process.env.NO_LOG) {
    process.stdout.write(`${req.method} ${req.url}\n`);
  }
  next();
};

const attachUser = async function (req, res, next) {
  const users = req.app.locals.users;
  req.user = await users.getUserInfo('palpriyanshu');
  next();
};

const serveDashboard = async function (req, res) {
  const blogsNeeded = 10;
  const recentStories = await req.app.locals.stories.get(blogsNeeded);
  res.render('dashboard', Object.assign({ recentStories, moment }, req.user));
};

const serveBlogImage = function (req, res) {
  const { blogImagePath } = req.app.locals;
  const [, root] = __dirname.match(/(.*express\/)(.*)/);
  res.sendFile(root + blogImagePath + req.params.imageID, (err) => {
    if (err) {
      res.status(statusCodes.notFound).send('<h1>Image Not Found</h1>');
    }
  });
};

const serveBlogPage = async function (req, res) {
  const blog = await req.app.locals.stories.getStory(req.params.storyID);

  if (blog) {
    res.render('blogPage', Object.assign(blog, req.user));
  } else {
    res.sendStatus(statusCodes.notFound);
  }
};

const createNewStory = async function (req, res) {
  const Stories = req.app.locals.stories;
  const newStoryParams = ['Untitled Story', req.user.id, 'drafted', []];
  const storyID = await Stories.addStory(...newStoryParams);
  res.redirect(`/editor/${storyID}`);
};

const renderEditor = async function (req, res) {
  const { stories } = req.app.locals;
  const storyContent = await stories.getStoryContent(
    req.params.storyID,
    req.user.id
  );

  if (storyContent) {
    res.render('editor', Object.assign(storyContent, req.user));
  } else {
    res.sendStatus(statusCodes.notFound);
  }
};

const checkIfUserIsTheAuthor = async function (req, res, next) {
  const { stories } = req.app.locals;
  const author = 'palpriyanshu';

  const story = await stories.getStoryContent(req.body.storyID, author);

  if (!story) {
    res.sendStatus(statusCodes.unprocessableEntity);
  } else {
    next();
  }
};

const saveStory = async function (req, res) {
  const { stories } = req.app.locals;
  const author = 'palpriyanshu';
  const { storyTitle, blocks: content, storyID: id } = req.body;
  const title = storyTitle.trim() || 'Untitled Story';

  await stories.updateStory({ title, content, state: 'drafted', author, id });
  res.end();
};

const publishStory = async function (req, res) {
  const author = 'palpriyanshu';
  const { stories } = req.app.locals;
  const { storyTitle: title, blocks: content, storyID: id } = req.body;

  if (!(title && title.trim())) {
    res.sendStatus(statusCodes.unprocessableEntity);
    return;
  }

  await stories.updateStory({ title, content, state: 'published', author, id });
  res.redirect(`/blogPage/${id}`);
};

const serveUserStoriesPage = async function (req, res) {
  const users = req.app.locals.users;
  const userInfo = await users.getUserInfo('palpriyanshu');
  const publishedStories = await users.getUserStories(userInfo.id, 'published');
  const draftedStories = await users.getUserStories(userInfo.id, 'drafted');
  res.render(
    'userStories',
    Object.assign({ publishedStories, draftedStories }, userInfo)
  );
};

const serveProfilePage = async function (req, res) {
  const users = req.app.locals.users;
  const userInfo = await users.getUserInfo('palpriyanshu');
  const authorID = req.params.authorID;
  const authorInfo = await users.getUserInfo(authorID);
  if (!authorInfo) {
    res.status(statusCodes.notFound).send('user not found');
    return;
  }
  const publishedStories = await users.getUserStories(authorID, 'published');
  res.render(
    'profile',
    Object.assign({ publishedStories, authorInfo }, userInfo)
  );
};

module.exports = {
  logRequest,
  attachUser,
  serveDashboard,
  serveBlogImage,
  serveBlogPage,
  createNewStory,
  renderEditor,
  checkIfUserIsTheAuthor,
  saveStory,
  publishStory,
  serveUserStoriesPage,
  serveProfilePage,
};
