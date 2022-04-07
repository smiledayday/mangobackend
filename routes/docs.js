const express = require('express')
const router = express.Router()
const connection = require('../connection')
const crypto = require('crypto')
const dayjs = require('dayjs')
const formatJson = require('../util/formatJson')

// 保存文章
router.post('/save', (req, res) => {
  try {
    const body = req.body
    if (body) {
      const { name, author, latestAt, content, id, firstLine } = body
      console.log(content)
      connection.query(`SELECT * FROM docs Where id = "${id}"`, (err, rows) => {
        //   找到了这篇文章
        if (rows.length > 0) {
          // 更新数据库中该文章内容等信息
          connection.query(
            `UPDATE docs SET title="${name}", author="${author}", latestAt="${dayjs(
              latestAt
            ).format(
              'YYYY-MM-DD HH:mm:ss'
            )}", content="${content}", firstLine="${firstLine}" WHERE id = "${id}"`,
            (err, rows) => {
              if (err) {
                console.log(err)
              } else {
                console.log('success')
                res.send('保存成功')
              }
            }
          )
        } else {
          const create_time = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss')
          connection.query(
            `INSERT INTO docs VALUES ("${name}","${id}", "${content}", "${author}", "${latestAt}", "${create_time}", type="普通文档")`,
            (err, rows) => {
              res.send('保存成功')
            }
          )
        }
      })
    }
  } catch (error) {
    console.log(error)
    res.status(500).send(formatJson(5, null, '服务器错误'))
  }
})

// 拿到所有文章 或按id查询文章
router.post('/see', (req, res) => {
  try {
    console.log(req.body)
    if (!req.body.id) {
      console.log('没有id')
      connection.query('SELECT * FROM docs', (err, rows) => {
        res.send({
          status: 1,
          data: { results: rows },
          message: '查询成功'
        })
      })
    } else {
      const { id } = req.body
      connection.query(`SELECT * FROM docs Where id = ${id}`, (err, rows) => {
        if (err) {
          console.log(err)
        } else {
          res.status(200).send(formatJson(1, rows, '查询特定文章成功'))
        }
      })
    }
  } catch (error) {
    console.log(error)
  }
})

module.exports = router
