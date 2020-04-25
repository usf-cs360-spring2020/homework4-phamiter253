import pandas as pd
import csv

f = pd.read_csv("C:\\Users\\cilla\\git\\homework4-phamiter253\\fire2020.csv")
keep_col = ['CallNumber','CallType','CallDate','Battalion']
new_f = f[keep_col]
new_f.to_csv("C:\\Users\\cilla\\git\\homework4-phamiter253\\newFile.csv", index=False)

# # df = pd.read_csv("C:\\Users\\cilla\\git\\homework4-phamiter253\\newFile.csv")
# # df.to_json("C:\\Users\\cilla\\git\\homework4-phamiter253\\newFile.json")

# csvfile = open("C:\\Users\\cilla\\git\\homework4-phamiter253\\newFile.csv", 'r')
# jsonfile = open("C:\\Users\\cilla\\git\\homework4-phamiter253\\newFile.json", 'w')

# fieldnames = ('CallNumber','CallType','CallDate','City','Battalion','Priority','CallTypeGroup', 'Neighborhoods')
# reader = csv.DictReader( csvfile, fieldnames)
# for row in reader:
#     json.dump(row, jsonfile)
#     jsonfile.write('\n')