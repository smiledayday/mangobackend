const express = require('express')
const router = express.Router()
const connection = require('../connection')
const crypto = require('crypto')
const dayjs = require('dayjs')
const jwt = require('jsonwebtoken')
const formatJson = require('../util/formatJson')

const typeofString = value => typeof value === 'string'

// SHA-256及以上强度的hash
const computeHash = value =>
  typeofString(value)
    ? crypto
        .createHash('sha512')
        .update(value)
        .digest('hex')
    : value

/* GET users listing. 根据用户名和密码查询*/
router.post('/login', function (req, res, next) {
  try {
    const body = req.body
    if (body) {
      const { username, password } = body
      if (
        typeofString(username) &&
        typeofString(password) &&
        username &&
        password
      ) {
        connection.query(
          `SELECT * FROM user Where username = "${body.username}"`,
          function (err, rows) {
            if (rows.length > 0) {
              const user = rows[0]
              const comparedPasswordHash = user.password
              const receivedPasswordHash = computeHash(password)
              if (receivedPasswordHash === comparedPasswordHash) {
                // 认证成功，下发token或session
                // 可通过cookie或response body返回给前端，response body更安全
                const issueAt = new Date()
                const header = { alg: 'HS256', typ: 'JWT' }
                jwt
                  .create()
                  .withIssuer(username)
                  .withIssuedAt(issueAt)
                  .withExpiresAt(issueAt.addHours(2))
                res.send(formatJson(1, null, null))
              } else {
                res.status(400).send(formatJson(4, null, '用户名或密码错误'))
              }
            } else {
              res.send('没有该用户')
            }
            if (err) {
              res.status(500).send(formatJson(5, null, '服务器错误'))
            }
          }
        )
      } else {
        res.status(400).send(formatJson(4, null, '缺少必要参数'))
      }
    }
    res.send('登录成功')
  } catch (error) {
    console.log(error)
    res.status(500).send(formatJson(5, null, '服务器错误'))
  }
})

router.post('/register', (req, res, next) => {
  try {
    let lessParams = false
    let typeError = false
    const body = req.body
    if (body) {
      const { username, password } = body
      if (username !== '' && password.length >= 8) {
        connection.query(
          `SELECT * FROM user Where username = "${body.username}"`,
          function (err, rows) {
            if (err) {
              res.status(500).send(formatJson(5, null, '服务器错误'))
            } else {
              console.log(rows)
              if (rows.length > 0) {
                res.status(400).send(formatJson(4, null, '用户名已被使用'))
              } else {
                const passwordHash = computeHash(password)
                const avatar = 'https://ibb.co/XLGQYs9'
                const create_time = dayjs(new Date()).format(
                  'YYYY-MM-DD HH:mm:ss'
                )
                connection.query(
                  `INSERT INTO user VALUES ("${username}", "${passwordHash}", "${avatar}", "${create_time}", null)`,
                  err => {
                    if (err) {
                      res.status(500).send(formatJson(5, null, '服务器错误'))
                    } else {
                      res.send({
                        status: 1,
                        data: { username, avatar, create_time },
                        message: '注册成功'
                      })
                    }
                  }
                )
              }
            }
          }
        )
      } else {
        if (!username || !password) {
          lessParams = true
        } else if (!typeofString(username) || !typeofString(password)) {
          typeError = true
        } else {
          typeError = true
        }
      }
    } else {
      lessParams = true
    }
    if (lessParams) {
      res.status(400).send(formatJson(4, null, '缺少必要参数'))
    } else if (typeError) {
      res.status(400).send(formatJson(4, null, '缺少必要参数'))
    }
  } catch (error) {
    console.log(error)
    res.status(500).send(formatJson(5, null, '服务器错误'))
  }
})

module.exports = router
