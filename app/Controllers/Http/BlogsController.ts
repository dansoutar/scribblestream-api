import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Blog from 'App/Models/Blog'

export default class BlogsController {
  public async index(ctx: HttpContextContract) {
    const { request, response } = ctx

    const blogQuery = Blog.query().preload('user')

    if (request.qs().search) {
      const [field, searchString] = request.qs().search.split(':')
      blogQuery.whereLike(field, `%${searchString}%`)
    }

    if (request.qs().order_by) {
      const [field, method] = request.qs().order_by.split(':')
      blogQuery.orderBy(field, method)
    }

    if (request.qs().page && request.qs().limit) {
      blogQuery.paginate(request.qs().page, request.qs().limit)
    }

    const blogs = await blogQuery

    response.status(200)
    response.send({
      message: 'Blogs',
      blogs: blogs,
    })
    return
  }

  public async show(ctx: HttpContextContract) {
    const { request, response } = ctx

    try {
      const blog = await Blog.query().preload('user').where('id', request.params().id).first()

      response.status(200)
      response.send({
        message: 'Blog',
        blog,
      })

      return
    } catch (error) {
      response.status(500)
      response.send({
        message: 'Cannot find blog record.',
      })

      return
    }
  }

  public async store(ctx: HttpContextContract) {
    const { request, response } = ctx

    if (!request.body().title || !request.body().content) {
      response.status(500)
      response.send({
        message: 'Missing required form data.',
      })
      return
    }

    const newBlog = await Blog.create({
      userId: request.all().user.id,
      title: request.body().title,
      content: request.body().content,
    })

    response.status(200)
    response.send({
      message: 'New blog entry created.',
      blog: newBlog,
    })
    return
  }

  public async update(ctx: HttpContextContract) {
    const { request, response } = ctx

    if (!request.body().title || !request.body().content) {
      response.status(500)
      response.send({
        message: 'Missing required form data.',
      })
      return
    }

    try {
      const blog = await Blog.findOrFail(request.params().id)

      if (blog.userId !== request.all().user.id) {
        response.status(401)
        response.send({
          message: 'You cannot edit this resource.',
        })
        return
      }

      blog.title = request.body().title
      blog.content = request.body().content
      blog.save()

      response.status(200)
      response.send({
        message: 'Blog has been updated.',
        blog: blog,
      })

      return
    } catch (error) {
      response.status(404)
      response.send({
        message: 'Cannot find blog record.',
      })

      return
    }
  }

  public async destroy(ctx: HttpContextContract) {
    const { request, response } = ctx

    try {
      const blog = await Blog.findOrFail(request.params().id)

      if (blog.userId !== request.all().user.id) {
        response.status(401)
        response.send({
          message: 'You cannot delete this resource.',
        })
        return
      }

      await blog.delete()
      response.status(200)
      response.send({
        message: 'Blog has been removed.',
      })
      return
    } catch (error) {
      response.status(404)
      response.send({
        message: 'Cannot find blog record.',
      })
      return
    }
  }
}
