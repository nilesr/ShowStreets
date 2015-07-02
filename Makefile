all:
	./css/images/render.sh
	inkscape --export-png=test.png test.svg
