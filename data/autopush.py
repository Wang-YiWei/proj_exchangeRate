#-*- coding: UTF-8 -*- 
#!/usr/bin/env python

import subprocess
import datetime

subprocess.call(["git", "add", "history.csv"])
subprocess.call(["git", "commit", "-m", "Update data automatically at " + str(datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"))])
subprocess.call(["git", "push"])
