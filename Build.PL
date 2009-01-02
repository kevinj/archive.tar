use Module::Build::JSAN;

my $build = Module::Build::JSAN->new(
  module_name    => 'Compress.Zlib',
  license        => 'perl',
  dist_author    => 'Kevin Jones <kevinj@cpan.org>',
  dist_abstract  => 'Interface to zlib compression library',
  dist_version   => '0.01',
  keywords       => [qw(Compress Zlib)],
  build_requires => {
      'Test.More' => 0.21,
      'Data.Dump' => 0.02,
      'JSAN' => 0.10,
      'Ajax' => 0.01,
  },
);

$build->create_build_script;

