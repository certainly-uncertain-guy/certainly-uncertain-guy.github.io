# Build the CV and publish it to the website.
#   make        -> build main.pdf and copy it to ../assets/pdf/Ashutosh_Shukla_Resume.pdf
#   make clean  -> remove LaTeX build files (keeps the PDFs)
PUBLISHED = ../assets/pdf/Ashutosh_Shukla_Resume.pdf

all: $(PUBLISHED)

main.pdf: main.tex preamble.tex resume.cls $(wildcard sections/*.tex)
	latexmk -pdf -interaction=nonstopmode main.tex

$(PUBLISHED): main.pdf
	cp main.pdf $(PUBLISHED)

clean:
	latexmk -c

.PHONY: all clean
