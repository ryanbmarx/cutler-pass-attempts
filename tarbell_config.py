# -*- coding: utf-8 -*-

"""
Tarbell project configuration
"""
from flask import Blueprint, g, render_template
import ftfy
import jinja2

blueprint = Blueprint('cutler-pass-by-pass', __name__)

@blueprint.app_template_filter('get_label_keys')
def get_label_keys(thing):
    return type(thing)

@blueprint.app_template_filter('make_mug_name')
def make_mug_name(receiver):
    try:
        name_first = clean_up_name(receiver['name_first'])
    except KeyError:
        name_first = ""

    name_last = clean_up_name(receiver['name_last'])
    return "{}{}".format(name_first, name_last)

def clean_up_name(name):
    return name.replace('\'', "").replace(' ', "").lower()
    



# Google spreadsheet key
SPREADSHEET_KEY = "1ZXvIfK-UR8Y6x1dEr7KNs6gLs5M_vxS1yY51hMa39nc"

# Exclude these files from publication
EXCLUDES = ['scripts', 'subtemplates', 'img/mugs/src', 'img/svgSrc/','*.md', 'requirements.txt', 'node_modules', 'sass', 'js/src', 'package.json', 'Gruntfile.js']

# Spreadsheet cache lifetime in seconds. (Default: 4)
# SPREADSHEET_CACHE_TTL = 4

# Create JSON data at ./data.json, disabled by default
# CREATE_JSON = True

# Get context from a local file or URL. This file can be a CSV or Excel
# spreadsheet file. Relative, absolute, and remote (http/https) paths can be 
# used.
# CONTEXT_SOURCE_FILE = ""

# EXPERIMENTAL: Path to a credentials file to authenticate with Google Drive.
# This is useful for for automated deployment. This option may be replaced by
# command line flag or environment variable. Take care not to commit or publish
# your credentials file.
# CREDENTIALS_PATH = ""

# S3 bucket configuration
S3_BUCKETS = {
    # Provide target -> s3 url pairs, such as:
    #     "mytarget": "mys3url.bucket.url/some/path"
    # then use tarbell publish mytarget to publish to it
    
    "production": "graphics.chicagotribune.com/cutler-pass-attempts",
    "staging": "apps.beta.tribapps.com/cutler-pass-attempts",
}

# Default template variables
DEFAULT_CONTEXT = {
    '_P2P_PUBLISHING_VARIABLES_': u"Don't edit these. They'll still work, for now, but you should instead make an entry in the p2p_content_items worksheet",
    'data': {   'another_key': {   'description': u'This is another description.',
                                   'key': u'another_key'},
                'example_key': {   'description': u'This is a description of a key.',
                                   'key': u'example_key'}},
    'example_key': u'This is an example of a template variable provided by the google spreadsheet',
    'name': 'cutler-pass-attempts',
    'p2p_content_items': [   {   'content_type': u'htmlstory',
                                 'template': u'_htmlstory.html'}],
    'title': 'Cutler'
}