import os
import secrets
from datetime import datetime

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

VERSION = "0.0.1"


connected_clients = {}
POSTGRES_USER = os.environ.get("POSTGRES_USER")
POSTGRES_PASSWORD = os.environ.get("POSTGRES_PASSWORD")
POSTGRES_DB = os.environ.get("POSTGRES_DB")
POSTGRES_HOST = os.environ.get("POSTGRES_HOST")
POSTGRES_PORT = os.environ.get("POSTGRES_PORT")


def connect_db():
    return psycopg2.connect(
        dbname=POSTGRES_DB,
        user=POSTGRES_USER,
        password=POSTGRES_PASSWORD,
        host=POSTGRES_HOST,
        port=POSTGRES_PORT,
    )


class PolicyHandler(tornado.web.RequestHandler):
    def get(self):
        template = env.get_template("policy.html")
        rendered_template = template.render()
        self.write(rendered_template)


class CurikiHandler(tornado.web.RequestHandler):
    def get(self):
        template = env.get_template("Curiki.html")
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


class VersionHandler(tornado.web.RequestHandler):
    def get(self):
        self.write({"version": VERSION})


def make_app():
    return tornado.web.Application(
        [
            (r"/", CurikiHandler),
            (r"/policy.html", PolicyHandler),
            (r"/Curiki.html", CurikiHandler),
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


def check_inactive_sessions():
    now = datetime.now()


if __name__ == "__main__":
    options.parse_command_line()
    app = tornado.httpserver.HTTPServer(make_app())
    app.listen(int(os.getenv("PORT", default=5500)))
    tornado.ioloop.PeriodicCallback(
        check_inactive_sessions, 60 * 60 * 1000
    ).start()  # Check every hour
    tornado.ioloop.IOLoop.instance().start()
