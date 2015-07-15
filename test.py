import turtle
def color(percent, blue="00"):
    if percent > 50:
        red = ((percent-50)*255)/100
    else:
        red = 0
    green = (200*percent/100) + 55
    red = str(hex(red))[2:]
    green = str(hex(green))[2:]
    if len(red) == 1: red = "0" + red
    if len(green) == 1: green = "0" + green
    return "#" + red + green + red
t = turtle.Turtle()
t.pu()
t.speed(0)
t.goto((-500, 0))
for x in range(100):
    t.color(color(x))
    t.dot(100)
    t.forward(10)
turtle.done()
