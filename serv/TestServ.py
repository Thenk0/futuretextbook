import cv2
import numpy as np
from mss import mss
from time import sleep
from mouse import move
from copy import deepcopy
from json import dumps, loads
from mediapipe import solutions
from keyboard import is_pressed
from colorama import Fore, Style
from keras import layers, Input, Model
from flask import Flask, render_template, Response
from google.protobuf.json_format import MessageToDict


class Camera:
    def __init__(self):
        self.cap = cv2.VideoCapture("http://192.168.31.107:8080/video")
        # self.cap = cv2.VideoCapture(0)

    def cam(self):
        suc, self.frame = self.cap.read()
        self.frame = cv2.flip(self.frame, -1)
        if suc:
            return self.frame

    def loads(self):
        return np.asarray(self.cam())


class Screen:
    def __init__(self):
        self.width, self.height = 640, 480
        self.bounding = {
            "top": 100,
            "left": 100,
            "width": self.width,
            "height": self.height,
        }

    def get_display(self):
        return np.asarray(mss().grab(self.bounding))

    def loads(self):
        return self.get_display() if self.get_display() is not None else sleep(0.002)


class Hands:
    def __init__(self):
        print("Started 2: WebCamReceiver")
        self.webcam = Camera()
        self.hands = solutions.hands.Hands(False, 1, 0, 0.71, 0.71)

    def flags_state(self, state):
        self.frame.flags.writeable = state

    def cvtcolor(self):
        return np.asarray(cv2.cvtColor(self.frame, cv2.COLOR_BGR2RGB))

    def hands_process(self):
        results = self.hands.process(self.webcamRGB)
        if results.multi_hand_landmarks is None or results.multi_handedness is None:
            return 0, 0
        return results.multi_hand_landmarks, results.multi_handedness

    def run(self):
        self.frame = self.webcam.loads()
        self.flags_state(state=False)
        self.webcamRGB = self.cvtcolor()
        self.flags_state(state=True)
        self.results, self.multi_hands = self.hands_process()
        return self.frame, self.results, self.multi_hands


class Merge:
    def __init__(self):
        self.screen = Screen()
        self.web = Hands()

    def cvtcolor(self):
        return cv2.cvtColor(np.asarray(self.news), cv2.COLOR_RGB2BGR)

    def resize(self):
        return cv2.resize(np.asarray(self.news), (640, 480)), cv2.resize(
            self.imgs, (640, 480)
        )

    def addweight(self):
        return cv2.addWeighted(self.news2, 1, self.imgs1, 1, 0)

    def run(self):
        self.news = self.screen.loads()
        self.imgs, self.results, self.multi_hands = self.web.run()
        self.news1, self.imgs1 = self.resize()
        self.news2 = self.cvtcolor()
        return self.addweight(), self.results, self.multi_hands


class Draw:
    def __init__(
        self,
    ):
        self.merge = Merge()
        self.hand_color = (0, 0, 255)
        self.thickness = (10, cv2.FILLED)

    def clone(self):
        return deepcopy(self.orange)

    def redirection(self):
        self.handLms = [lm for lm in np.asarray(self.results)]
        self.handLms = self.handLms[0].landmark
        self.h, self.w, _ = self.orange1.shape
        return self.starting()

    def starting(self):
        self.image1 = self.drawlower()
        self.image2 = self.drawwrist()
        self.image3 = self.drawfinger()
        self.hsv = self.get_hsv()
        self.rangers = self.get_range()
        self.ytc2 = self.bitwise()
        return self.replacement()

    def drawlower(self):
        # lower fingers
        handLms5x = int(self.handLms[5].x * self.w)
        handLms5y = int(self.handLms[5].y * self.h)
        handLms9x = int(self.handLms[9].x * self.w)
        handLms9y = int(self.handLms[9].y * self.h)
        handLms13x = int(self.handLms[13].x * self.w)
        handLms13y = int(self.handLms[13].y * self.h)
        handLms17x = int(self.handLms[17].x * self.w)
        handLms17y = int(self.handLms[17].y * self.h)
        cv2.line(
            self.orange1,
            (handLms5x, handLms5y),
            (handLms9x, handLms9y),
            self.hand_color,
            self.thickness[0],
        )
        cv2.line(
            self.orange1,
            (handLms9x, handLms9y),
            (handLms13x, handLms13y),
            self.hand_color,
            self.thickness[0],
        )
        cv2.line(
            self.orange1,
            (handLms13x, handLms13y),
            (handLms17x, handLms17y),
            self.hand_color,
            self.thickness[0],
        )
        # ?
        cv2.line(
            self.orange1,
            (int(self.handLms[1].x * self.w), int(self.handLms[1].y * self.h)),
            (handLms5x, handLms5y),
            self.hand_color,
            self.thickness[0],
        )
        return self.orange1

    def drawwrist(self):
        # wrist
        for i in range(5):
            cv2.line(
                self.image1,
                (int(self.handLms[0].x * self.w), int(self.handLms[0].y * self.h)),
                (
                    int(self.handLms[i * 4 + 1].x * self.w),
                    int(self.handLms[i * 4 + 1].y * self.h),
                ),
                self.hand_color,
                self.thickness[0],
            )
        return self.image1

    def drawfinger(self):
        # fingers
        for i in range(5):
            for p in range(1 + i * 4, 1 + i * 4 + 3):
                handLmsPx = int(self.handLms[p].x * self.w)
                handLmsPy = int(self.handLms[p].y * self.h)
                cv2.line(
                    self.image2,
                    (handLmsPx, handLmsPy),
                    (
                        int(self.handLms[p + 1].x * self.w),
                        int(self.handLms[p + 1].y * self.h),
                    ),
                    self.hand_color,
                    self.thickness[0],
                )
                cv2.circle(
                    self.image2,
                    (handLmsPx, handLmsPy),
                    10,
                    (0, 255, 0),
                    self.thickness[1],
                )
        return self.image2

    def get_hsv(self):
        return cv2.cvtColor(self.image3, cv2.COLOR_BGR2HSV)

    def get_range(self):
        lower_and_upper_range = np.asarray([(28, 94, 45), (255, 255, 255)])
        return cv2.inRange(self.hsv, lower_and_upper_range[0], lower_and_upper_range[1])

    def bitwise(self):
        ytc = cv2.bitwise_and(self.image3, self.image3, mask=self.rangers)
        return self.image3 - ytc

    def replacement(self):
        return np.where(
            cv2.cvtColor(self.rangers, cv2.COLOR_GRAY2BGR), self.orange, self.ytc2
        )

    def run(self):
        self.orange, self.results, self.multi_hands = self.merge.run()
        if self.results == 0 or self.multi_hands == 0:
            return self.orange, 0, 0
        else:
            self.orange1 = self.clone()
            self.final_results = self.redirection()
            return self.final_results, self.results, self.multi_hands


class Gesture:
    def __init__(self):
        self.i = 0
        self.state = 0
        self.final = Draw()
        self.modleft1, self.modleft2, self.modleft3 = None, None, None
        self.modright1, self.modright2, self.modright3 = None, None, None
        self.new = [[], [], [], [], [], []]
        self.new[1].append({"gesture": "first"})
        self.new[3].append({"gesture": "second"})
        self.new[5].append({"gesture": "third"})
        self.width, self.height = 0, 0

    def get_both_hands(self):
        self.frame, results, multi_hands = np.asarray(self.final.run(), dtype=object)
        if type(results) == int or type(multi_hands) == int:
            return self.frame, 0, 0
        for _, hands in enumerate(multi_hands):
            return self.frame, hands, results

    def hands(self):
        self.points_left_hand = {"x": [], "y": [], "state": []}
        self.normalized_coordinates_for_left_hands = [[], []]
        for handLms in np.asarray(self.results):
            return (
                self.points_left_hand,
                handLms,
                self.normalized_coordinates_for_left_hands,
            )

    def find_poins(self):
        (
            self.points_hands,
            self.handLms,
            self.normalized_coordinates_for_hands,
        ) = np.asarray(self.hands(), dtype=object)
        result = self.points_for_hands()
        result2 = self.normalized_coordinates()
        return result, result2

    def points_for_hands(self):
        for i in range(21):
            self.points_hands["x"].append(self.handLms.landmark[i].x)
            self.points_hands["y"].append(self.handLms.landmark[i].y)
        return deepcopy(self.points_hands)

    def normalized_coordinates(self):
        for i in range(21):
            x, y = self.handLms.landmark[i].x * 1920, self.handLms.landmark[i].y * 1080
            self.normalized_coordinates_for_hands[0].append(x)
            self.normalized_coordinates_for_hands[1].append(y)
            self.moving()
        return deepcopy(np.asarray(self.normalized_coordinates_for_hands))

    def moving(self):
        sr_x = 0
        sr_y = 0
        sr_x += self.normalized_coordinates_for_hands[0][0]
        sr_y += self.normalized_coordinates_for_hands[1][0]
        sr_x /= 2
        sr_y /= 2
        return move(sr_x, sr_y)

    def hotkeys_keyboard(self, points_hands, state, hands, iterator):
        second_new = []
        points_hands["state"].append(f"{state}")
        second_new.append(points_hands)
        self.new[iterator].append(second_new)
        self.write(self.new, left_or_right=f"{hands}")
        return points_hands

    def write(self, points, left_or_right):
        with open(f"./Gestures for {left_or_right} hand.txt", "w") as f:
            f.write(dumps(points) + "\n")
            print(f"{self.i}: Writed")
            self.i += 1

    def start_find(self, mod1, mod2, mod3, points_hands, iter1, iter2, iter3):
        inputstrain = []
        inputstrain.append([points_hands["x"], points_hands["y"]])
        self.predictss(mod1, mod2, mod3, inputstrain, iter1, iter2, iter3)
        inputstrain.clear()

    def predictss(self, model1, model2, model3, inputstrain, iter1, iter2, iter3):
        results = model1.predict(np.asarray(inputstrain), verbose=0)
        results2 = model2.predict(np.asarray(inputstrain), verbose=0)
        results3 = model3.predict(np.asarray(inputstrain), verbose=0)
        self.appends(results, results2, results3, iter1, iter2, iter3)

    def appends(self, results, results2, results3, iter1, iter2, iter3):
        if np.mean(results) > 0.7:
            print(
                Style.BRIGHT,
                Fore.LIGHTWHITE_EX,
                f"Gesture {iter1} --  ",
                np.mean(results),
            )
        elif np.mean(results2) > 0.7:
            print(
                Style.BRIGHT,
                Fore.LIGHTWHITE_EX,
                f"Gesture {iter2} --  ",
                np.mean(results2),
            )
        elif np.mean(results3) > 0.7:
            print(
                Style.BRIGHT,
                Fore.LIGHTWHITE_EX,
                f"Gesture {iter3} --  ",
                np.mean(results3),
            )

    def read_from_file(self, left_or_right, iterator):
        inputs = []
        inputs.append(
            [
                loads(line)
                for line in open(f"./Gestures for {left_or_right} hand.txt", "r")
            ]
        )
        mod = self.find_right_points(inputs, iterator)
        inputs.clear()
        return mod

    def find_right_points(self, inputs, iterator):
        outputs = []
        new_inputs = []
        for i in inputs[0]:
            for j in i[iterator]:
                if "True" in j[0]["state"]:
                    new_inputs, outputs = self.append_readed_data(
                        outputs, new_inputs, j, 1
                    )
                else:
                    new_inputs, outputs = self.append_readed_data(
                        outputs, new_inputs, j, 0
                    )
        mod = self.starter(new_inputs, outputs)
        new_inputs.clear()
        outputs.clear()
        return mod

    def append_readed_data(self, outputs, new_inputs, i, one_or_zero):
        outputs.append([one_or_zero])
        new_inputs.append([i[0]["x"], i[0]["y"]])
        return new_inputs, outputs

    def starter(self, new_inputs, outputs):
        model = self.createmodel()
        self.compile(model)
        self.train(model, new_inputs, outputs)
        return model

    def createmodel(self):
        inputs = Input(shape=(2, 21), name="hand")
        x = layers.Dense(21, activation="relu", name="dense_1")(inputs)
        x = layers.BatchNormalization()(x)
        x = layers.Dense(10, activation="relu", name="dense_2")(x)
        x = layers.BatchNormalization()(x)
        x = layers.Dense(5, activation="relu", name="dense_3")(x)
        x = layers.BatchNormalization()(x)
        outputs = layers.Dense(1, activation="relu", name="predictions")(x)
        model = Model(inputs=inputs, outputs=outputs)
        return model

    def compile(self, model):
        model.compile(optimizer="adam", loss="mae", metrics=["mae"])

    def train(self, model, inputs1, outputs1):
        model.fit(
            np.asarray(inputs1),
            np.asarray(outputs1),
            batch_size=40,
            epochs=400,
            verbose=0,
        )

    def return_hands_and_results(self):
        self.frame, hands, results = np.asarray(self.get_both_hands(), dtype=object)
        if type(hands) == int or type(results) == int:
            return self.frame, 0, 0
        else:
            handedness_dict = MessageToDict(hands)
            return self.frame, handedness_dict, results

    def first_if(self, points, states):
        self.hotkeys_keyboard(
            points, state=states, hands="Right", iterator=self.iterator
        )

    def train_right_hand_model(self):
        self.modright1 = self.read_from_file(left_or_right="Right", iterator=0)
        self.modright2 = self.read_from_file(left_or_right="Right", iterator=2)
        self.modright3 = self.read_from_file(left_or_right="Right", iterator=4)
        self.state = 1

    def train_left_hand_model(self):
        self.modleft1 = self.read_from_file(left_or_right="Right", iterator=0)
        self.modleft2 = self.read_from_file(left_or_right="Right", iterator=2)
        self.modleft3 = self.read_from_file(left_or_right="Right", iterator=4)
        self.state = 3

    def if_state(self, points, mod1, mod2, mod3):
        self.start_find(mod1, mod2, mod3, points, iter1=1, iter2=2, iter3=3)

    def run(self):
        self.frame, handedness_dict, self.results = self.return_hands_and_results()
        if (
            type(handedness_dict) == int
            or type(self.results) == int
            or handedness_dict == 0
        ):
            sleep(0.02)
        else:
            if handedness_dict["classification"][0]["label"] == "Right":
                points_right_hand1, _ = self.find_poins()
                if is_pressed("f"):
                    self.iterator = 0
                    self.first_if(points_right_hand1, states="True") if is_pressed(
                        "1"
                    ) else self.first_if(
                        points_right_hand1, states="False"
                    ) if is_pressed(
                        "2"
                    ) else self.train_right_hand_model() if is_pressed(
                        "3"
                    ) else None
                elif is_pressed("s"):
                    self.iterator = 2
                    self.first_if(points_right_hand1, states="True") if is_pressed(
                        "1"
                    ) else self.first_if(
                        points_right_hand1, states="False"
                    ) if is_pressed(
                        "2"
                    ) else self.train_right_hand_model() if is_pressed(
                        "3"
                    ) else None
                elif is_pressed("g"):
                    self.iterator = 4
                    self.first_if(points_right_hand1, states="True") if is_pressed(
                        "1"
                    ) else self.first_if(
                        points_right_hand1, states="False"
                    ) if is_pressed(
                        "2"
                    ) else self.train_right_hand_model() if is_pressed(
                        "3"
                    ) else None
                elif self.state == 1:
                    self.if_state(
                        points_right_hand1,
                        self.modright1,
                        self.modright2,
                        self.modright3,
                    )
            else:
                self.redirection2()
        return self.frame

    def redirection2(self):
        points_left_hand1, _ = self.find_poins()
        if is_pressed("c"):
            self.iterator = 0
            self.first_if(points_left_hand1, states="True") if is_pressed(
                "4"
            ) else self.first_if(points_left_hand1, states="False") if is_pressed(
                "5"
            ) else self.train_left_hand_model() if is_pressed(
                "6"
            ) else None
        elif is_pressed("v"):
            self.iterator = 2
            self.first_if(points_left_hand1, states="True") if is_pressed(
                "4"
            ) else self.first_if(points_left_hand1, states="False") if is_pressed(
                "5"
            ) else self.train_left_hand_model() if is_pressed(
                "6"
            ) else None
        elif is_pressed("b"):
            self.iterator = 4
            self.first_if(points_left_hand1, states="True") if is_pressed(
                "4"
            ) else self.first_if(points_left_hand1, states="False") if is_pressed(
                "5"
            ) else self.train_left_hand_model() if is_pressed(
                "6"
            ) else None
        elif self.state == 3:
            self.if_state(
                points_left_hand1,
                self.modleft1,
                self.modleft2,
                self.modleft3,
            )


gesture = Gesture()
app = Flask(__name__)


def gen_frames():
    while 1:
        frame = gesture.run()
        _, buffer = cv2.imencode(".jpg", frame)
        frame = buffer.tobytes()
        yield b"--frame\r\n" b"Content-Type: image/jpg\r\n\r\n" + frame + b"\r\n"


@app.route("/video_feed")
def video_feed():
    return Response(gen_frames(), mimetype="multipart/x-mixed-replace; boundary=frame")


@app.route("/")
def index():
    return render_template("index.html")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=False)
