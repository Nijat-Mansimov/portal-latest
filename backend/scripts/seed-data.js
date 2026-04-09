require('dotenv').config();
const { poolPromise, sql } = require('../config/db');

async function run() {
  try {
    const pool = await poolPromise;

    // Insert test services
    const services = [
      {
        title: 'Email Dashboard',
        description: 'Access your email tools and team inbox.',
        url: 'https://example.com/email',
        tutorialUrl: 'https://www.youtube.com/watch?v=ysz5S6PUM-U'
      },
      {
        title: 'HR Portal',
        description: 'Manage employee records and benefits.',
        url: 'https://example.com/hr',
        tutorialUrl: 'https://www.youtube.com/watch?v=J---aiyznGQ'
      }
    ];

    for (const service of services) {
      await pool
        .request()
        .input('title', sql.NVarChar(255), service.title)
        .input('description', sql.NVarChar(sql.MAX), service.description)
        .input('url', sql.NVarChar(1024), service.url)
        .input('tutorialUrl', sql.NVarChar(1024), service.tutorialUrl)
        .query(
          "INSERT INTO Services (Title, Description, RedirectUrl, TutorialUrl, IsDeleted, CreatedAt, UpdatedAt) VALUES (@title, @description, @url, @tutorialUrl, 0, GETUTCDATE(), GETUTCDATE())"
        );
    }

    // Insert test news
    const newsItems = [
      {
        title: 'Platform Upgrade Available',
        coverImageUrl: '/uploads/news-upgrade.png',
        content: 'We have rolled out a new version of the portal with performance improvements.',
        publishDate: new Date()
      },
      {
        title: 'Holiday Schedule 2026',
        coverImageUrl: '/uploads/holiday.png',
        content: 'The company will have the following holiday schedule for 2026.',
        publishDate: new Date()
      }
    ];

    for (const item of newsItems) {
      await pool
        .request()
        .input('title', sql.NVarChar(255), item.title)
        .input('coverImageUrl', sql.NVarChar(1024), item.coverImageUrl)
        .input('content', sql.NVarChar(sql.MAX), item.content)
        .input('publishDate', sql.DateTime, item.publishDate)
        .query(
          "INSERT INTO News (Title, CoverImageUrl, Content, PublishDate, IsDeleted, CreatedAt, UpdatedAt) VALUES (@title, @coverImageUrl, @content, @publishDate, 0, GETUTCDATE(), GETUTCDATE())"
        );
    }

    console.log('Seed data successfully inserted.');
    process.exit(0);
  } catch (err) {
    console.error('Seed data failed:', err);
    process.exit(1);
  }
}

run();
