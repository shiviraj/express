const latestNStoriesQuery = function (count, offset) {
  return `SELECT usr.display_name as authorName, str.*
  FROM stories AS str
  JOIN users AS usr 
  ON str.written_by = usr.id
  WHERE state='published'
  ORDER BY str.last_modified DESC
  LIMIT ${offset},${count};`;
};

const publishedStoryQuery = function (storyID) {
  return `SELECT usr.display_name as authorName,usr.avatar_url,
  str.title,str.content,str.id as storyID,str.written_by as authorID,
  date(str.last_modified) as lastModified
  FROM stories AS str
  JOIN users AS usr 
  ON str.written_by = usr.id
  WHERE state='published' AND str.id='${storyID}';`;
};

const storyOfUserQuery = function (storyID, userID) {
  return `SELECT title, content, state, id as storyID 
          FROM stories 
          WHERE id='${storyID}' AND written_by='${userID}';`;
};

const userProfileQuery = function (userID) {
  return `
  SELECT usr.id as profileID, usr.display_name as profileName, 
  usr.avatar_url as profileAvatar, usr.bio,
  str.id as storyID, str.title, str.content, 
  str.cover_image as coverImage, date(str.last_modified) as lastModified
  FROM users as usr 
  LEFT JOIN stories as str ON usr.id=str.written_by 
  WHERE usr.id='${userID}' AND (str.state='published' OR str.state IS NULL);
  `;
};

module.exports = {
  latestNStoriesQuery,
  publishedStoryQuery,
  storyOfUserQuery,
  userProfileQuery,
};