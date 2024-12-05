# -*- coding: gbk -*-
import random
import json
from datetime import datetime, timedelta

# 定义常量
UNITS_MAP = {
    "心率": "BPM",
    "血氧饱和度": "%",
    "血压": "mmHg",
    "体温": "°C",
    "呼吸率": "次/分",
    "血糖": "mmol/L",
    "心率变异性": "ms",
    "压力水平": "/5"
}

NORMAL_RANGES = {
    "心率": {"min": 60, "max": 100},
    "血氧饱和度": {"min": 95, "max": 100},
    "血压": {
        "systolic": {"min": 90, "max": 140},
        "diastolic": {"min": 60, "max": 90}
    },
    "体温": {"min": 36.3, "max": 37.2},
    "呼吸率": {"min": 12, "max": 20},
    "血糖": {"min": 4.4, "max": 6.7},
    "心率变异性": {"min": 30, "max": 90},
    "压力水平": {"min": 1, "max": 4}
}

ABNORMAL_RANGES = {
    "心率": [{"min": 30, "max": 50}, {"min": 120, "max": 180}],
    "血氧饱和度": [{"min": 85, "max": 92}],
    "血压": {
        "systolic": [{"min": 70, "max": 90}, {"min": 160, "max": 200}],
        "diastolic": [{"min": 40, "max": 55}, {"min": 100, "max": 120}]
    },
    "体温": [{"min": 35.0, "max": 36.0}, {"min": 38.0, "max": 40.0}],
    "呼吸率": [{"min": 5, "max": 10}, {"min": 25, "max": 35}],
    "血糖": [{"min": 2.0, "max": 3.9}, {"min": 11.0, "max": 15.0}],
    "心率变异性": [{"min": 10, "max": 25}, {"min": 100, "max": 150}],
    "压力水平": [{"min": 5, "max": 5}]
}

def generate_value(data_type, is_abnormal=False):
    if data_type == "血压":
        if is_abnormal:
            systolic_range = random.choice(ABNORMAL_RANGES[data_type]["systolic"])
            diastolic_range = random.choice(ABNORMAL_RANGES[data_type]["diastolic"])
            systolic = random.randint(systolic_range["min"], systolic_range["max"])
            diastolic = random.randint(diastolic_range["min"], diastolic_range["max"])
        else:
            systolic = random.randint(NORMAL_RANGES[data_type]["systolic"]["min"], 
                                    NORMAL_RANGES[data_type]["systolic"]["max"])
            diastolic = random.randint(NORMAL_RANGES[data_type]["diastolic"]["min"], 
                                     NORMAL_RANGES[data_type]["diastolic"]["max"])
        return f"{systolic}/{diastolic}"
    
    ranges = ABNORMAL_RANGES[data_type] if is_abnormal else [NORMAL_RANGES[data_type]]
    selected_range = random.choice(ranges)
    
    if data_type in ["体温", "血氧饱和度", "血糖"]:
        return f"{random.uniform(selected_range['min'], selected_range['max']):.1f}"
    else:
        return str(random.randint(selected_range["min"], selected_range["max"]))

def generate_data_entries(num_entries):
    entries = []
    id_counter = 1
    base_time = datetime.strptime("2024-01-15 08:00:00", "%Y-%m-%d %H:%M:%S")
    
    for _ in range(num_entries):
        entry = {}
        entry["id"] = id_counter
        entry["timestamp"] = (base_time + timedelta(minutes=random.randint(0, 60*24*30))).strftime("%Y-%m-%d %H:%M:%S")
        entry["type"] = random.choice(list(NORMAL_RANGES.keys()))
        entry["bed"] = f"{random.randint(1, 4)}号床"
        is_abnormal = random.random() < 0.05
        entry["value"] = generate_value(entry["type"], is_abnormal)
        entry["unit"] = UNITS_MAP[entry["type"]]
        entries.append(entry)
        id_counter += 1
    
    return sorted(entries, key=lambda x: x["timestamp"])

def generate_json_data(num_entries):
    entries = generate_data_entries(num_entries)
    json_data = {"vitalDataList": entries}
    return json.dumps(json_data, indent=2, ensure_ascii=False)

# 生成JSON数据并保存到文件
generated_json_data = generate_json_data(100000)
output_file_path = 'public/data/vitalData.json'  # 注意这里不需要 app 前缀

# 确保输出目录存在
import os
os.makedirs(os.path.dirname(output_file_path), exist_ok=True)

# 将数据写入文件
with open(output_file_path, 'w', encoding='utf-8') as f:
    f.write(generated_json_data)

print(f"数据已成功保存到: {output_file_path}")
