#-*- coding: UTF-8 -*- 
#!/usr/bin/env python

import csv
import requests
from bs4 import BeautifulSoup

allCountry = [
    'USD','HKD','GBP','AUD','CAD','SGD','CHF','JPY','ZAR','SEK',
    'NZD','THB','PHP','IDR','EUR','KRW','VND','MYR','CNY'
]

allCountry2 = [
    '美金 (','港幣 (','英鎊 (','澳幣 (','加拿大幣 (','新加坡幣 (','瑞士法郎 (',
    '日圓幣 (','南非幣 (','瑞典幣 (','紐元 (','泰幣 (','菲國比索 (','印尼幣 (',
    '歐元 (','韓元 (','越南盾 (','馬來幣 (','人民幣 ('
]


fptr = open("history.csv","w",encoding = 'UTF-8')
fptr.write('x,country,date,historyValue1,historyValue2,historyValue3,historyValue4')
fptr.write('\n')

for i in range(0,19):
    res = requests.get('http://rate.bot.com.tw/xrt/quote/ltm/'+allCountry[i])
    soup = BeautifulSoup(res.text, "lxml")
    tbody = soup.select('tbody')[0]
    tr = tbody.select('tr')
    
    cashRates = soup.select('.rate-content-cash.text-right.print_table-cell')
    sightRates = soup.select('.rate-content-sight.text-right.print_table-cell')
    
    x = 0
    ratecount = 0

    for item in tr:
        fptr.write(str(x))
        fptr.write(',')
        fptr.write(allCountry[i])
        fptr.write(',')
        fptr.write (item.select('.text-center')[0].text.strip().strip(allCountry2[i]+')')
        .strip('下載 Excel 檔').replace('返回上頁','').replace('列印本頁','')
        .replace('請按Ctrl + P / 請按 Backspace 鍵或 Alt + 向左鍵','').replace(' ',''))
        fptr.write(',')
        fptr.write (cashRates[ratecount].text.replace('-','0'))
        fptr.write(',')
        fptr.write (cashRates[ratecount+1].text.replace('-','0'))
        fptr.write(',')
        fptr.write (sightRates[ratecount].text.replace('-','0'))
        fptr.write(',')
        fptr.write (sightRates[ratecount+1].text.replace('-','0'))
        fptr.write('\n')
        x = x + 1
        ratecount = ratecount + 2 
fptr.close()
