import os
import secrets

from dotenv import load_dotenv
import jinja2
import psycopg2
import tornado.gen
import tornado.httpserver
import tornado.ioloop
import tornado.web
import tornado.websocket
from tornado.options import options

load_dotenv()

loader = jinja2.FileSystemLoader("dist/html")
env = jinja2.Environment(loader=loader)


class PolicyHandler(tornado.web.RequestHandler):
    def get(self):
        template = env.get_template("policy.html")
        rendered_template = template.render()
        self.write(rendered_template)


class CurikiHandler(tornado.web.RequestHandler):
    def get(self):
        template = env.get_template("curiki.html")
        rendered_template = template.render()
        self.write(rendered_template)


class ManitobaCurriculumOverviewHandler(tornado.web.RequestHandler):
    def get(self):
        template = env.get_template("manitobaCurriculumOverview.html")
        rendered_template = template.render()
        self.write(rendered_template)


class ManitobaMathematicsCurriculumHandler(tornado.web.RequestHandler):
    def get(self):
        template = env.get_template("manitobaMathematicsCurriculum.html")
        rendered_template = template.render()
        self.write(rendered_template)


class ManitobaScienceCurriculumHandler(tornado.web.RequestHandler):
    def get(self):
        template = env.get_template("manitobaScienceCurriculum.html")
        rendered_template = template.render()
        self.write(rendered_template)


class ManitobaBiologyCurriculumHandler(tornado.web.RequestHandler):
    def get(self):
        template = env.get_template("manitobaBiologyCurriculum.html")
        rendered_template = template.render()
        self.write(rendered_template)


class ManitobaSocialStudiesCurriculum(tornado.web.RequestHandler):
    def get(self):
        template = env.get_template("manitobaSocialStudiesCurriculum.html")
        rendered_template = template.render()
        self.write(rendered_template)


class LessonPlanHandler(tornado.web.RequestHandler):
    def get(self):
        template = env.get_template("lessonPlan.html")
        rendered_template = template.render()
        self.write(rendered_template)


def make_app():
    return tornado.web.Application(
        [
            (r"/", CurikiHandler),
            (r"/policy.html", PolicyHandler),
            (r"/curiki.html", CurikiHandler),
            (r"/manitobaCurriculumOverview.html", ManitobaCurriculumOverviewHandler),
            (r"/manitobaMathematicsCurriculum.html", ManitobaMathematicsCurriculumHandler),
            (r"/manitobaScienceCurriculum.html", ManitobaScienceCurriculumHandler),
            (r"/manitobaBiologyCurriculum.html", ManitobaBiologyCurriculumHandler),
            (r"/manitobaSocialStudiesCurriculum.html", ManitobaSocialStudiesCurriculum),
            (r"/lessonPlan.html", LessonPlanHandler),
            (r"/dist/(.*)", tornado.web.StaticFileHandler, {"path": "dist"}),
            (r"/static/(.*)", tornado.web.StaticFileHandler, {"path": "app/static"}),
        ],
        cookie_secret=os.environ.get("COOKIE_SECRET", secrets.token_hex(32)),
    )


if __name__ == "__main__":
    options.parse_command_line()
    app = tornado.httpserver.HTTPServer(make_app())
    app.listen(int(os.getenv("PORT", default=5500)))
    tornado.ioloop.IOLoop.instance().start()
